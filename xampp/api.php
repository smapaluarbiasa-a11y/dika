<?php
/**
 * Backend PHP Lokal untuk XAMPP (htdocs) - Upload Soal SMAN 1 Pakem
 * ==================================================================
 * Otomatis menyimpan data naskah ke folder lokal `xampp_data/` (tanpa perlu setup MySQL).
 * Opsional: Jika ingin memakai database MySQL (phpMyAdmin), import file `database.sql`
 * lalu ubah $USE_MYSQL menjadi true di bawah ini.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==================== KONFIGURASI OPSIONAL MYSQL ====================
$USE_MYSQL = false; // Ubah ke true jika ingin memakai MySQL phpMyAdmin (import database.sql dulu)
$DB_HOST = '127.0.0.1';
$DB_NAME = 'db_upload_soal_sman1pakem';
$DB_USER = 'root';
$DB_PASS = '';
// ===================================================================

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'xampp_data';
$docsFile = $dataDir . DIRECTORY_SEPARATOR . 'documents.json';
$configFile = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0775, true);
}

function getPdoConnection($host, $db, $user, $pass) {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function readJsonFile($path, $default) {
    if (!file_exists($path)) {
        return $default;
    }
    $content = @file_get_contents($path);
    if ($content === false) {
        return $default;
    }
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $default;
}

function writeJsonFile($path, $data) {
    @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);
if (!is_array($body)) {
    $body = [];
}

// Support method override via query/body for older Apache configurations
if (isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
} elseif (isset($body['_method'])) {
    $method = strtoupper($body['_method']);
}

try {
    // 1. GET /documents
    if ($route === 'documents' && $method === 'GET') {
        if ($USE_MYSQL) {
            $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
            $stmt = $pdo->query("SELECT * FROM exam_documents ORDER BY uploadedAt DESC");
            $docs = $stmt->fetchAll();
            foreach ($docs as &$d) {
                $d['durationMinutes'] = (int)$d['durationMinutes'];
                $d['estimatedQuestions'] = (int)$d['estimatedQuestions'];
                $d['fileSizeBytes'] = (int)$d['fileSizeBytes'];
            }
        } else {
            $docs = readJsonFile($docsFile, []);
        }

        echo json_encode([
            'status' => 'success',
            'count' => count($docs),
            'documents' => $docs,
            'source' => 'xampp-php',
        ]);
        exit;
    }

    // 2. POST /documents (Add / Upsert)
    if ($route === 'documents' && $method === 'POST') {
        if (empty($body['title']) || empty($body['subject'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Identitas naskah tidak lengkap.']);
            exit;
        }

        if ($USE_MYSQL) {
            $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
            $sql = "REPLACE INTO exam_documents (
                id, title, subject, grade, assessmentType, durationMinutes, estimatedQuestions,
                fileName, fileFormat, fileSizeBytes, uploadedAt, status, committeeNotes,
                revisionFeedback, verifiedBy, verifiedAt, fileDataUrl
            ) VALUES (
                :id, :title, :subject, :grade, :assessmentType, :durationMinutes, :estimatedQuestions,
                :fileName, :fileFormat, :fileSizeBytes, :uploadedAt, :status, :committeeNotes,
                :revisionFeedback, :verifiedBy, :verifiedAt, :fileDataUrl
            )";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $body['id'] ?? ('doc-' . time()),
                ':title' => $body['title'] ?? '',
                ':subject' => $body['subject'] ?? '',
                ':grade' => $body['grade'] ?? 'Kelas X',
                ':assessmentType' => $body['assessmentType'] ?? 'ASAS',
                ':durationMinutes' => (int)($body['durationMinutes'] ?? 90),
                ':estimatedQuestions' => (int)($body['estimatedQuestions'] ?? 40),
                ':fileName' => $body['fileName'] ?? 'naskah.pdf',
                ':fileFormat' => $body['fileFormat'] ?? 'pdf',
                ':fileSizeBytes' => (int)($body['fileSizeBytes'] ?? 0),
                ':uploadedAt' => $body['uploadedAt'] ?? date('c'),
                ':status' => $body['status'] ?? 'Menunggu Review',
                ':committeeNotes' => $body['committeeNotes'] ?? '',
                ':revisionFeedback' => $body['revisionFeedback'] ?? '',
                ':verifiedBy' => $body['verifiedBy'] ?? '',
                ':verifiedAt' => $body['verifiedAt'] ?? '',
                ':fileDataUrl' => $body['fileDataUrl'] ?? '',
            ]);
        } else {
            $docs = readJsonFile($docsFile, []);
            $filtered = array_values(array_filter($docs, function ($d) use ($body) {
                return ($d['id'] ?? '') !== ($body['id'] ?? '');
            }));
            array_unshift($filtered, $body);
            writeJsonFile($docsFile, $filtered);
        }

        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'document' => $body,
            'message' => 'Naskah berhasil disimpan di server XAMPP.',
        ]);
        exit;
    }

    // 3. PATCH /documents/{id}/status
    if (preg_match('#^documents/([^/]+)/status$#', $route, $matches) && ($method === 'PATCH' || $method === 'POST')) {
        $id = $matches[1];
        $status = $body['status'] ?? null;
        $feedback = $body['feedback'] ?? null;

        if ($USE_MYSQL) {
            $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
            $stmt = $pdo->prepare("UPDATE exam_documents SET status = COALESCE(:status, status), revisionFeedback = COALESCE(:feedback, revisionFeedback), verifiedBy = 'Panitia Kurikulum & Asesmen', verifiedAt = :verifiedAt WHERE id = :id");
            $stmt->execute([
                ':status' => $status,
                ':feedback' => $feedback,
                ':verifiedAt' => date('c'),
                ':id' => $id,
            ]);
            echo json_encode(['status' => 'success', 'id' => $id]);
        } else {
            $docs = readJsonFile($docsFile, []);
            $found = false;
            foreach ($docs as &$doc) {
                if (($doc['id'] ?? '') === $id) {
                    $found = true;
                    if ($status !== null) {
                        $doc['status'] = $status;
                    }
                    if ($feedback !== null) {
                        $doc['revisionFeedback'] = $feedback;
                    }
                    $doc['verifiedBy'] = 'Panitia Kurikulum & Asesmen';
                    $doc['verifiedAt'] = date('c');
                }
            }
            if (!$found) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Dokumen tidak ditemukan.']);
                exit;
            }
            writeJsonFile($docsFile, $docs);
            echo json_encode(['status' => 'success', 'id' => $id]);
        }
        exit;
    }

    // 4. DELETE /documents/{id}
    if (preg_match('#^documents/([^/]+)$#', $route, $matches) && ($method === 'DELETE' || $method === 'POST')) {
        $id = $matches[1];

        if ($USE_MYSQL) {
            $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
            $stmt = $pdo->prepare("DELETE FROM exam_documents WHERE id = :id");
            $stmt->execute([':id' => $id]);
        } else {
            $docs = readJsonFile($docsFile, []);
            $filtered = array_values(array_filter($docs, function ($d) use ($id) {
                return ($d['id'] ?? '') !== $id;
            }));
            writeJsonFile($docsFile, $filtered);
        }

        echo json_encode([
            'status' => 'success',
            'id' => $id,
            'message' => 'Dokumen berhasil dihapus dari XAMPP.',
        ]);
        exit;
    }

    // 5. GET & POST /config
    if ($route === 'config') {
        if ($method === 'GET') {
            $cfg = readJsonFile($configFile, ['appsScriptUrl' => '']);
            echo json_encode(['status' => 'success', 'config' => $cfg]);
            exit;
        }
        if ($method === 'POST') {
            $cfg = ['appsScriptUrl' => trim($body['appsScriptUrl'] ?? '')];
            writeJsonFile($configFile, $cfg);
            echo json_encode(['status' => 'success', 'config' => $cfg]);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Endpoint api.php tidak ditemukan.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
