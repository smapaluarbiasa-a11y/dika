/**
 * Generates Microsoft Word (.doc) compatible files using Word HTML specification.
 * Microsoft Word natively opens files with this MIME type and XML namespace with 100% fidelity.
 */

export function generateExamPaperWordTemplate(): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Template Naskah Soal Ujian - SMA Negeri 1 Pakem</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.25;
      color: #000000;
    }
    .kop-container {
      text-align: center;
      margin-bottom: 2px;
    }
    .kop-pemerintah {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5pt;
      text-transform: uppercase;
      margin: 0;
    }
    .kop-sekolah {
      font-size: 16pt;
      font-weight: bold;
      letter-spacing: 1pt;
      text-transform: uppercase;
      margin: 2px 0;
    }
    .kop-alamat {
      font-size: 9.5pt;
      margin: 2px 0 6px 0;
      font-style: italic;
    }
    .kop-garis {
      border-top: 3px double #000000;
      margin: 4px 0 16px 0;
    }
    .judul-naskah {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .subjudul-naskah {
      text-align: center;
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 14px;
    }
    table.identitas {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 11pt;
      border: 1px solid #000000;
    }
    table.identitas td {
      padding: 4px 8px;
      vertical-align: top;
      border: 1px solid #000000;
    }
    .petunjuk-box {
      border: 1px solid #000000;
      padding: 8px 12px;
      margin-bottom: 18px;
      font-size: 10.5pt;
      background-color: #fbfbfb;
    }
    .petunjuk-box ol {
      margin: 4px 0;
      padding-left: 20px;
    }
    .petunjuk-box li {
      margin-bottom: 3px;
    }
    .soal-item {
      margin-bottom: 14px;
      text-align: justify;
    }
    .soal-nomor {
      font-weight: bold;
      display: inline-block;
      width: 24px;
    }
    .pilihan-ganda {
      margin-left: 24px;
      margin-top: 4px;
    }
    .tabel-pengesahan {
      width: 100%;
      margin-top: 30px;
      border: none;
    }
    .tabel-pengesahan td {
      border: none;
      text-align: center;
      font-size: 11pt;
      vertical-align: top;
    }
  </style>
</head>
<body>
<div class="Section1">
  <!-- KOP SURAT RESMI -->
  <div class="kop-container">
    <p class="kop-pemerintah">PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA</p>
    <p class="kop-pemerintah">DINAS PENDIDIKAN, PEMUDA, DAN OLAHRAGA</p>
    <p class="kop-sekolah">SEKOLAH MENENGAH ATAS (SMA) NEGERI 1 PAKEM</p>
    <p class="kop-alamat">Jalan Kaliurang Km. 17.5, Pakem, Sleman, D.I. Yogyakarta 55582 &bull; Telp. (0274) 895127 &bull; Pos-el: sma1pakem@yahoo.co.id</p>
    <div class="kop-garis"></div>
  </div>

  <div class="judul-naskah">NASKAH SOAL ASESMEN SUMATIF AKHIR SEMESTER (ASAS)</div>
  <div class="subjudul-naskah">TAHUN AJARAN 2026/2027 &bull; SEMESTER GANJIL</div>

  <!-- TABEL IDENTITAS UJIAN -->
  <table class="identitas">
    <tr>
      <td width="20%"><strong>Mata Pelajaran</strong></td>
      <td width="30%">: [Isi Mata Pelajaran]</td>
      <td width="20%"><strong>Hari / Tanggal</strong></td>
      <td width="30%">: Senin, [Tanggal Ujian]</td>
    </tr>
    <tr>
      <td><strong>Tingkat Kelas</strong></td>
      <td>: Kelas X / XI / XII</td>
      <td><strong>Alokasi Waktu</strong></td>
      <td>: 90 Menit</td>
    </tr>
    <tr>
      <td><strong>Guru Penyusun</strong></td>
      <td>: [Nama Guru & Gelar]</td>
      <td><strong>Jumlah Soal</strong></td>
      <td>: 40 Butir (35 PG + 5 Uraian)</td>
    </tr>
  </table>

  <!-- PETUNJUK PENGERJAAN -->
  <div class="petunjuk-box">
    <strong>PETUNJUK UMUM:</strong>
    <ol>
      <li>Periksalah kelengkapan naskah soal dan nomor halaman sebelum memulai mengerjakan.</li>
      <li>Tuliskan identitas Anda secara lengkap dan benar pada Lembar Jawaban yang telah disediakan.</li>
      <li>Dahulukan menjawab soal-soal yang Anda anggap paling mudah terlebih dahulu.</li>
      <li>Pilihlah salah satu jawaban yang paling tepat dengan menghitamkan bulatan atau tanda silang pada huruf A, B, C, D, atau E.</li>
      <li>Tidak diperkenankan menggunakan kalkulator, gawai (HP), atau alat bantu hitung lainnya kecuali ada izin khusus.</li>
      <li>Periksa kembali seluruh lembar pekerjaan Anda sebelum diserahkan kepada pengawas ruangan.</li>
    </ol>
  </div>

  <!-- BAGIAN BUTIR NASKAH SOAL -->
  <p style="font-weight: bold; margin-bottom: 8px;">I. PILIHAN GANDA (Pilihlah satu jawaban yang paling tepat!)</p>

  <div class="soal-item">
    <span class="soal-nomor">1.</span>
    Berikut ini adalah contoh penulisan stimulus dan butir soal pertama yang disusun secara kontekstual sesuai dengan Capaian Pembelajaran Kurikulum Merdeka. Perhatikan pernyataan berikut untuk menjawab pertanyaan:
    <div class="pilihan-ganda">
      A. Opsi pilihan jawaban A<br/>
      B. Opsi pilihan jawaban B<br/>
      C. Opsi pilihan jawaban C<br/>
      D. Opsi pilihan jawaban D<br/>
      E. Opsi pilihan jawaban E
    </div>
  </div>

  <div class="soal-item">
    <span class="soal-nomor">2.</span>
    Berdasarkan data grafik dan tabel di atas, kesimpulan yang paling tepat dan merefleksikan hasil analisis kognitif tingkat tinggi (HOTS) adalah...
    <div class="pilihan-ganda">
      A. Peningkatan berbanding lurus dengan variabel kontrol<br/>
      B. Penurunan terjadi akibat faktor eksternal lingkungan<br/>
      C. Nilai optimum tercapai pada parameter standar<br/>
      D. Tidak ada korelasi signifikan antar variabel<br/>
      E. Parameter uji mengalami fluktuasi periodik
    </div>
  </div>

  <p style="font-style: italic; color: #555555; text-align: center; margin: 20px 0;">
    [ ... Lanjutkan penulisan butir naskah soal nomor 3 sampai dengan nomor 40 ... ]
  </p>

  <p style="font-weight: bold; margin-bottom: 8px; margin-top: 18px;">II. URAIAN / ESSAY</p>
  <div class="soal-item">
    <span class="soal-nomor">41.</span>
    Jelaskan analisis komprehensif Anda mengenai implikasi materi tersebut dalam pemecahan masalah kehidupan nyata secara sistematis!
  </div>

  <!-- TABEL TANDA TANGAN / PENGESAHAN -->
  <table class="tabel-pengesahan">
    <tr>
      <td width="50%">
        Mengetahui,<br/>
        Ketua Panitia Asesmen Sekolah<br/><br/><br/><br/>
        <strong><u>Drs. Hendro Wibowo, M.Pd.</u></strong><br/>
        NIP. 19740512 199903 1 004
      </td>
      <td width="50%">
        Pakem, Sleman, .............................. 2026<br/>
        Guru Mata Pelajaran Penyusun,<br/><br/><br/><br/>
        <strong><u>( .................................................. )</u></strong><br/>
        NIP. ...............................................
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

export function generateRubricWordTemplate(): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Template Kisi-Kisi & Rubrik Penskoran - SMA Negeri 1 Pakem</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 841.9pt 595.3pt; /* Landscape A4 */
      margin: 1.5cm 1.5cm 1.5cm 1.5cm;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.2;
    }
    .kop-container { text-align: center; margin-bottom: 8px; }
    .kop-sekolah { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
    .kop-garis { border-top: 2px solid #000; margin: 4px 0 12px 0; }
    .judul { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
    table.tabel-kisi { width: 100%; border-collapse: collapse; font-size: 10pt; }
    table.tabel-kisi th { background-color: #f2f2f2; border: 1px solid #000; padding: 6px; font-weight: bold; text-align: center; }
    table.tabel-kisi td { border: 1px solid #000; padding: 6px; vertical-align: top; }
  </style>
</head>
<body>
<div class="Section1">
  <div class="kop-container">
    <div style="font-size: 11pt; font-weight: bold;">DINAS PENDIDIKAN, PEMUDA, DAN OLAHRAGA DIY &bull; SMA NEGERI 1 PAKEM</div>
    <div class="kop-sekolah">PANITIA PENYUSUNAN NASKAH SOAL & ASESMEN SEKOLAH</div>
    <div class="kop-garis"></div>
  </div>

  <div class="judul">FORMAT KISI-KISI PENULISAN SOAL & PEDOMAN PENSKORAN ASESMEN</div>
  <p><strong>Mata Pelajaran:</strong> [Isi Mapel] &nbsp;|&nbsp; <strong>Kelas:</strong> [X / XI / XII] &nbsp;|&nbsp; <strong>Guru Pengampu:</strong> [Nama Guru]</p>

  <table class="tabel-kisi">
    <thead>
      <tr>
        <th width="4%">No</th>
        <th width="20%">Capaian Pembelajaran (CP)</th>
        <th width="22%">Tujuan Pembelajaran (TP) / Materi</th>
        <th width="24%">Indikator Ketercapaian Soal</th>
        <th width="10%">Level Kognitif</th>
        <th width="10%">Bentuk Soal</th>
        <th width="10%">No. Soal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Peserta didik mampu memahami prinsip dasar keilmuan dan kaitannya dengan fenomena kontekstual sehari-hari.</td>
        <td>Konsep Esensial dan Hukum Utama dalam Kehidupan</td>
        <td>Disajikan ilustrasi kasus, peserta didik mampu mengidentifikasi variabel utama secara kritis.</td>
        <td style="text-align: center;">L2 (Aplikasi)</td>
        <td style="text-align: center;">PG</td>
        <td style="text-align: center;">1, 2, 3</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Peserta didik mampu menganalisis keterkaitan struktural dan mengevaluasi efektivitas solusi permasalahan.</td>
        <td>Evaluasi Model dan Analisis Kuantitatif Terpadu</td>
        <td>Diberikan tabel data eksperimen, peserta didik dapat menyimpulkan korelasi antar variabel.</td>
        <td style="text-align: center;">L3 (Penalaran / HOTS)</td>
        <td style="text-align: center;">PG & Uraian</td>
        <td style="text-align: center;">4, 5, 41</td>
      </tr>
    </tbody>
  </table>

  <br/>
  <div style="font-weight: bold; margin-bottom: 6px;">PEDOMAN PENSKORAN & KUNCI JAWABAN:</div>
  <table class="tabel-kisi" style="width: 70%;">
    <thead>
      <tr>
        <th width="15%">No. Soal</th>
        <th width="25%">Kunci Jawaban</th>
        <th width="60%">Bobot / Rubrik Penskoran</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1 - 35</td>
        <td style="text-align: center;">A / B / C / D / E</td>
        <td>Setiap jawaban benar mendapat skor 2 (Skor Maksimal PG = 70)</td>
      </tr>
      <tr>
        <td style="text-align: center;">36 - 40</td>
        <td>Uraian Terbuka</td>
        <td>Skor 0-6 per nomor sesuai rubrik kelengkapan analisis (Skor Maksimal Uraian = 30)</td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`;
}

/**
 * Triggers instant download of a document file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadWordExamTemplate() {
  const content = generateExamPaperWordTemplate();
  downloadFile(
    content,
    'Template_Naskah_Soal_Ujian_SMAN1Pakem.doc',
    'application/msword;charset=utf-8'
  );
}

export function downloadWordRubricTemplate() {
  const content = generateRubricWordTemplate();
  downloadFile(
    content,
    'Template_Kisi_Kisi_dan_Rubrik_Penskoran.doc',
    'application/msword;charset=utf-8'
  );
}
