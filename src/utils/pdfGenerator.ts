import { jsPDF } from 'jspdf';
import { ExamDocument } from '../types/naskah';

/**
 * Generates a clean, standard, valid PDF Data URL for documents without Kop Surat or Ketua Panitia.
 * Conforms to ISO PDF standards and renders flawlessly in PDF.js and all browser viewers.
 */
export function generateCleanPdfDataUrl(doc: ExamDocument): string {
  // If user already uploaded their own real PDF file, use it directly
  if (doc.fileDataUrl && doc.fileFormat === 'pdf') {
    return doc.fileDataUrl;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Clean Header (Without Kop Surat and Without Ketua Panitia)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(doc.title || `Naskah Soal ${doc.subject}`, margin, 25);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(80, 80, 80);

  const metaText = `Mata Pelajaran: ${doc.subject}   |   Tingkat: ${doc.grade}   |   Waktu: ${doc.durationMinutes} Menit   |   Jumlah: ${doc.estimatedQuestions} Butir`;
  pdf.text(metaText, margin, 32);

  // Clean separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.4);
  pdf.line(margin, 36, pageWidth - margin, 36);

  // Instructions Box
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, 40, contentWidth, 22, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(margin, 40, contentWidth, 22, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(50, 50, 50);
  pdf.text('PETUNJUK UMUM PENGERJAAN ASESMEN:', margin + 4, 46);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(70, 70, 70);
  pdf.text('1. Periksalah naskah soal dan lembar jawaban sebelum mulai mengerjakan.', margin + 4, 51);
  pdf.text('2. Pilihlah salah satu opsi jawaban yang paling tepat pada lembar jawaban yang tersedia.', margin + 4, 56);

  // Questions Section
  let y = 72;

  const sampleQuestions = doc.previewContent?.sampleQuestions || [
    {
      number: 1,
      text: `Butir naskah soal asesmen mata pelajaran ${doc.subject} untuk ${doc.grade}. Berdasarkan analisis stimulus kontekstual dan indikator pembelajaran, penyelesaian permasalahan yang paling tepat adalah...`,
      choices: [
        'A. Pilihan jawaban alternatif pertama sesuai indikator',
        'B. Pilihan jawaban alternatif kedua mengenai karakteristik materi pokok',
        'C. Pilihan jawaban alternatif ketiga terkait verifikasi variabel',
        'D. Pilihan jawaban alternatif keempat hasil sintesis',
        'E. Pilihan jawaban alternatif kelima evaluasi komparatif',
      ],
    },
    {
      number: 2,
      text: `Perhatikan fenomena dan data empiris pada stimulus soal. Kesimpulan dan implikasi logis yang dapat dirumuskan secara ilmiah adalah...`,
      choices: [
        'A. Hipotesis pertama terbukti dengan tingkat signifikansi tinggi',
        'B. Variabel bebas tidak memiliki korelasi linear',
        'C. Terdapat peningkatan efektivitas berdasarkan model uji',
        'D. Parameter pengukuran memerlukan kalibrasi ulang',
        'E. Korelasi antar variabel menunjukkan kecenderungan positif',
      ],
    },
  ];

  pdf.setTextColor(20, 20, 20);

  for (const q of sampleQuestions) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(`${q.number}.`, margin, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const splitQuestion = pdf.splitTextToSize(q.text, contentWidth - 8);
    pdf.text(splitQuestion, margin + 7, y);

    y += splitQuestion.length * 5 + 3;

    if (q.choices && q.choices.length > 0) {
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      for (const choice of q.choices) {
        const splitChoice = pdf.splitTextToSize(choice, contentWidth - 12);
        pdf.text(splitChoice, margin + 9, y);
        y += splitChoice.length * 4.5;
      }
      y += 4;
      pdf.setTextColor(20, 20, 20);
    }
  }

  // Footer document note (No Kop Surat and No Ketua Panitia)
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    `SMAN 1 Pakem - Berkas Resmi Naskah Soal Asesmen (${doc.fileName})`,
    margin,
    285
  );

  return pdf.output('datauristring');
}
