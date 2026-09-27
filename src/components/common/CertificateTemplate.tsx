import { displaySerialNumber, type CertificatePrintItem } from "@/lib/types";

type CertificateTemplateProps = {
  certificate: CertificatePrintItem;
};

const SIDE_LABELS = Array.from({ length: 6 }, () => "العبد");
const FOOTER_LABELS = Array.from({ length: 3 }, () => "العبد");

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
    <article className="certificate-sheet relative mx-auto flex min-h-[297mm] w-[210mm] flex-col overflow-hidden bg-[#eeb8c8] px-6 py-4 text-black shadow-[0_18px_40px_-28px_rgba(15,61,62,0.45)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/watermark.png"
        alt=""
        aria-hidden="true"
        className="certificate-watermark pointer-events-none absolute left-1/2 top-[58%] z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.12] select-none"
        draggable={false}
      />

      <header className="relative z-[1] grid grid-cols-[1fr_1.5fr_1fr] items-start gap-2 px-3">
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
          <div
            className="certificate-ticket-hex mt-3 flex h-[120px] w-[138px] items-center justify-center"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 100 87"
              className="h-full w-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="25,1.5 75,1.5 98.5,43.5 75,85.5 25,85.5 1.5,43.5"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="miter"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div aria-hidden="true" />
      </header>

      <p
        lang="ur"
        dir="rtl"
        className="pointer-events-none absolute right-8 top-[8rem] z-10 font-[family-name:var(--font-urdu)] text-[18px] font-extrabold leading-none text-black"
      >
        صدر
      </p>

      <div className="relative z-[1] mt-2 grid flex-1 grid-cols-[3.25rem_1fr_3.25rem] items-start gap-4">
        <aside
          lang="ur"
          className="flex flex-col items-center justify-between gap-16 pt-8 pb-2 font-[family-name:var(--font-urdu)] text-black"
          aria-hidden="true"
        >
          {SIDE_LABELS.map((label, index) => (
            <span
              key={`left-${index}`}
              className="inline-block origin-center rotate-[90deg] whitespace-nowrap text-[44px] font-extrabold leading-none"
            >
              {label}
            </span>
          ))}
        </aside>

        <section
          lang="ur"
          dir="rtl"
          className="flex flex-col px-5 pt-8 font-[family-name:var(--font-urdu)] text-[18px] leading-9 text-black"
        >
          <div className="w-full">
            <p className="whitespace-nowrap text-right">
              <span>بعدالت جناب</span>
              <DashField width="11rem" />
              <span>منجانب</span>
              <DashField width="11rem" />
            </p>

            <p className="mt-2 text-right">
              <span>عنوان</span>
              <DashField width="13rem" />
              <span>بنام</span>
              <DashField width="13rem" />
            </p>

            <p className="mt-2 text-right">
              <span>دعویٰ / درخواست</span>
              <DashField width="14rem" />
            </p>

            <p className="mt-2 text-right">
              <span>مقدمہ نمبر</span>
              <DashField width="10rem" />
              <span>جرم</span>
              <DashField width="10rem" />
            </p>

            <p className="mt-2 whitespace-nowrap text-right">
              <span>مقدمہ مندرجہ عنوان میں اپنی طرف سے بمقام</span>
              <DashField width="7rem" />
              <span>برائے پیروی و جوابدہی</span>
            </p>

            <p className="mt-2 text-right">
              <span>محترم جناب</span>
              <DashField width="30rem" />
            </p>

            <p className="mt-3 text-justify text-[14px] leading-7">
            کو بدین شرط وکیل مقرر کیا ہے کہ میں ہر پیشی پر خود یا بذریعہ مختارِ خاص 
            بروز پیشی حاضر ہوتا رہوں گا۔ اور بروقت پکارے جانے وکیل صاحب موصوف کو اطلاع دے کر
              حاضر عدالت کروں گا۔ پیشی پر مظہر حاضر نہ ہو اور مقدمہ میری غیر حاضری
              کی وجہ سے کسی طور پر میرے برخلاف ہو گیا تو صاحب موصوف اس کے کسی طرح
              ذمہ دار نہ ہوں گے۔ اگر مقدمہ صاحب مذکور کی کسی  دانستہ غفلت سے میرے برخلاف
              ہو گیا تو صاحب موصوف تاحد مختانہ نقصانات  ہرجانہ کے ذمہ دار ہوں گے۔ لیکن
              وکیل موصوف صدر مقام کچہری کے علاوہ اور جگہ سماعت ہونے یا بروز تعطیل
              یا کچہری کے اوقات سے پیچھے ہونے پَر مظہر کو کوئی نقصان پہنچے تو
              اس کے ذمہ دار اس کے واسطے کسی معاوضہ ادا درخواست یا محنتانہ واپس کرنے کے
              یا کسی صورت میں صاحب موصوف ذمہ دار نہ ہوں گے۔ بھی کوئی کل ساختہ راضی
              صاحب موصوف مثل خود قبول ہوگا۔ صاحب موصوف کوئی زبانی و تحریری خواست
              دائر اجرام کی منظوری ڈگری یکطرفہ درخواست حکم امتناعی یا ترقی یا
              گرفتاری قبل از فیصلہ اجرام ڈگری یا بشرط ادائیگی علیم و مختانہ پیروی
              اختیار ہو گا۔ کہ مقدمہ مذکور یا اس کے کسی جزو کی کارروائی کے واسطے
              کسی دوسرے وکیل یا بیرسٹر کو بہائے اپنے اطمینان مقرر کریں اور ایسے
              مشیر تفاویض کو ہر امر میں اور ویسے ہی اختیارات حاصل ہوں گے جیسے صاحب
              موصوف کو حاصل ہیں اور دوران مقدمہ میں جو کچھ ہم جانہ التواپے گا صاحب
              موصوف کو پورا اختیار ہو گا کہ وہ مقدمہ کی پیروی نہ کریں اور ایسی
              صورت میں میرا کوئی مطالبہ کسی قسم کا صاحب موصوف کے برخلاف نہ ہو گا۔
              نیز رقومات داخل کردہ کہ ہر طرح وصولی بذریعہ چیک ہائے وغیرہ کا اختیار
              وکیل صاحب موصوف کو ہو گا۔ لہذا یہ وکالت نامہ لکھ دیا ہے کہ سند رہے۔
              وکالت نامہ سن لیا ہے اور اچھی طرح سمجھ لیا ہے اور منظور ہے۔ مورخہ
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 pb-2 text-center">
            {FOOTER_LABELS.map((label, index) => (
              <div key={`footer-${index}`} className="flex flex-col items-center">
                <p className="text-[36px] font-extrabold leading-none">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <aside
          lang="ur"
          className="flex flex-col items-center justify-between gap-16 pt-8 pb-2 font-[family-name:var(--font-urdu)] text-black"
          aria-hidden="true"
        >
          {SIDE_LABELS.map((label, index) => (
            <span
              key={`right-${index}`}
              className="inline-block origin-center rotate-[-90deg] whitespace-nowrap text-[44px] font-extrabold leading-none"
            >
              {label}
            </span>
          ))}
        </aside>
      </div>
    </article>
  );
}
