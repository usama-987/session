import { displaySerialNumber, type CertificatePrintItem } from "@/lib/types";

type CertificateTemplateProps = {
  certificate: CertificatePrintItem;
};

const SIDE_LABELS = Array.from({ length: 5 }, () => "العبد");

function DashField({ width = "10rem" }: { width?: string }) {
  return (
    <span
      className="mx-1 inline-block translate-y-[-2px] border-b border-dashed border-black"
      style={{ width, minWidth: width }}
      aria-hidden="true"
    />
  );
}

/**
 * Printed Vakalat Nama form.
 * Handwriting replaced with dashed blanks. No stamps or signatures.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const [year, month, day] = certificate.issuedDate.split("-");
  const dated = `${day}-${month}-${year}`;
  const serialLabel = displaySerialNumber(certificate.serialNumber);

  return (
    <article className="certificate-sheet relative mx-auto flex min-h-[297mm] w-[210mm] flex-col overflow-hidden bg-[#f6c9ce] px-3 py-4 text-black shadow-[0_18px_40px_-28px_rgba(15,61,62,0.45)]">
      <header className="relative grid grid-cols-[1fr_1.5fr_1fr] items-start gap-2 px-2">
        <div dir="ltr" className="flex flex-col items-start gap-1 pt-1 text-left">
          <p className="font-[family-name:var(--font-body)] text-[12px] font-bold leading-tight tracking-wide">
            DATED: {dated}
          </p>
          <p className="font-[family-name:var(--font-body)] text-[12px] font-bold leading-tight tracking-wide">
            {serialLabel}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certificate.qrDataUrl}
            alt={`QR for ${serialLabel}`}
            className="mt-1 h-[68px] w-[68px] border border-black bg-transparent p-[2px]"
          />
        </div>

        <div
          lang="ur"
          dir="rtl"
          className="flex flex-col items-center justify-start pt-1 text-center font-[family-name:var(--font-urdu)]"
        >
          <h1 className="text-[30px] font-bold leading-relaxed tracking-[0.12em] text-black">
            وکالت نامہ
          </h1>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed tracking-wide text-black">
            ڈسٹرکٹ بار ایسوسی ایشن، بہاول نگر
          </p>
        </div>

        <div aria-hidden="true" />
      </header>

      <p
        lang="ur"
        dir="rtl"
        className="pointer-events-none absolute right-4 top-[9.5rem] z-10 font-[family-name:var(--font-urdu)] text-[18px] font-extrabold leading-none text-black"
      >
        صدر
      </p>

      <div className="mt-2 grid flex-1 grid-cols-[2.25rem_1fr_2.25rem] gap-0">
        <aside
          lang="ur"
          className="flex flex-col items-center justify-around py-10 font-[family-name:var(--font-urdu)] text-black"
          aria-hidden="true"
        >
          {SIDE_LABELS.map((label, index) => (
            <span
              key={`left-${index}`}
              className="inline-block origin-center rotate-[90deg] whitespace-nowrap text-[32px] font-extrabold leading-none"
            >
              {label}
            </span>
          ))}
        </aside>

        <section
          lang="ur"
          dir="rtl"
          className="flex flex-col px-3 pt-28 font-[family-name:var(--font-urdu)] text-[16px] leading-9 text-black"
        >
          <div className="w-full">
            <p className="text-right">
              <span>بعدالت جناب</span>
              <DashField width="16rem" />
              <span>منجانب</span>
            </p>

            <p className="mt-2 text-right">
              <span>عنوان</span>
              <DashField width="13rem" />
              <span>بنام</span>
              <DashField width="13rem" />
            </p>

            <p className="mt-2 text-right">
              <span>دعویٰ / درخواست تحت دفعہ</span>
              <DashField width="14rem" />
            </p>

            <p className="mt-2 text-right">
              <span>مقدمہ نمبر</span>
              <DashField width="12rem" />
            </p>

            <p className="mt-2 text-right">
              <span>مقدمہ مندرجہ عنوان میں اپنی طرف سے بمقام</span>
              <DashField width="11rem" />
              <span>برائے پیروی و جوابدہی</span>
            </p>

            <p className="mt-2 text-right">
              <span>محترم جناب</span>
              <DashField width="16rem" />
            </p>

            <p className="mt-4 text-justify text-[15px] leading-8">
              العبد کو اپنا وکیل مقرر کرتا / کرتی ہوں۔ مذکورہ وکیل کو اختیار حاصل ہے
              کہ میرے / ہمارے مقدمہ کی پیروی کرے، جواب دے، دلائل پیش کرے، دستاویزات
              داخل کرے، شواہد پیش کرے، شہادت درج کروائے، تصفیہ، مصالحت، دستبرداری،
              دعویٰ واپس لینے، اپیل، نظرثانی، نظر ثانی، رٹ، عرضی یا کوئی اور قانونی
              کارروائی کرے، نیز عدالت سے جو بھی حکم صادر ہو اسے میرے / ہمارے حق میں
              تسلیم کیا جائے گا۔ وکیل کو یہ بھی اختیار ہوگا کہ وہ اپنی جگہ کسی دوسرے
              وکیل کو مقرر کرے اور وہ تمام کارروائیاں انجام دے جو میں خود حاضر ہو کر
              کر سکتا / سکتی ہوں۔ یہ وکالت نامہ میری / ہماری رضامندی اور درست ہوش و
              حواس میں تحریر کیا گیا ہے۔
            </p>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-4 pb-4 pt-10 text-center">
            {["العبد", "العبد", "العبد"].map((label, index) => (
              <div key={`footer-${index}`} className="flex flex-col items-center">
                <p className="text-[36px] font-extrabold leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <aside
          lang="ur"
          className="flex flex-col items-center justify-around py-10 font-[family-name:var(--font-urdu)] text-black"
          aria-hidden="true"
        >
          {SIDE_LABELS.map((label, index) => (
            <span
              key={`right-${index}`}
              className="inline-block origin-center rotate-[-90deg] whitespace-nowrap text-[32px] font-extrabold leading-none"
            >
              {label}
            </span>
          ))}
        </aside>
      </div>
    </article>
  );
}
