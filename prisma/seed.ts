import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/* Positions per department with uz/ru/en variants */
const POS = {
  headCert: {
    uz: "Sertifikatlash organi rahbari",
    ru: "Руководитель органа по сертификации",
    en: "Head of certification body",
  },
  leadCert: {
    uz: "Sertifikatlash organi yetakchi mutaxassisi",
    ru: "Ведущий специалист органа по сертификации",
    en: "Leading specialist of the certification body",
  },
  specCert: {
    uz: "Sertifikatlash organi mutaxassisi",
    ru: "Специалист органа по сертификации",
    en: "Specialist of the certification body",
  },
  asstCert: {
    uz: "Sertifikatlash organi assistenti",
    ru: "Ассистент органа по сертификации",
    en: "Certification assistant of the certification body",
  },
  headLab: {
    uz: "Sinov laboratoriyasi rahbari",
    ru: "Руководитель испытательной лаборатории",
    en: "Head of the testing laboratory",
  },
  leadLab: {
    uz: "Sinov laboratoriyasi yetakchi mutaxassisi",
    ru: "Ведущий специалист испытательной лаборатории",
    en: "Leading specialist of the testing laboratory",
  },
  specLab: {
    uz: "Sinov laboratoriyasi mutaxassisi",
    ru: "Специалист испытательной лаборатории",
    en: "Specialist of the testing laboratory",
  },
  techLab: {
    uz: "Sinov laboratoriyasi texnigi",
    ru: "Техник испытательной лаборатории",
    en: "Testing laboratory technician",
  },
} as const;

type PosKey = keyof typeof POS;

const STAFF: { slug: string; name: string; pos: PosKey; dept: "certification" | "laboratory" }[] = [
  { slug: "valiev-xojiakbar", name: "Valiev Xojiakbar", pos: "headCert", dept: "certification" },
  { slug: "inagamov-shuxrat", name: "Inagamov Shuxrat", pos: "leadCert", dept: "certification" },
  { slug: "davronbek-atabekov", name: "Davronbek Atabekov", pos: "leadCert", dept: "certification" },
  { slug: "saidgani-gulyamov", name: "Saidg'ani Gulyamov", pos: "specCert", dept: "certification" },
  { slug: "bahrom-solihov", name: "Bahrom Solihov", pos: "asstCert", dept: "certification" },
  { slug: "ibroxim-daminjonov", name: "Ibroxim Daminjonov", pos: "asstCert", dept: "certification" },
  { slug: "firdavs-jorabekov", name: "Firdavs Jo'rabekov", pos: "asstCert", dept: "certification" },
  { slug: "ibrohim-shofarhodov", name: "Ibrohim Shofarhodov", pos: "asstCert", dept: "certification" },
  { slug: "baxtiyor-ramazonov", name: "Baxtiyor Ramazonov", pos: "asstCert", dept: "certification" },
  { slug: "xamidulla-ubaydullaev", name: "Xamidulla Ubaydullaev", pos: "headLab", dept: "laboratory" },
  { slug: "suhrob-iskandarov", name: "Suhrob Iskandarov", pos: "leadLab", dept: "laboratory" },
  { slug: "abbos-ikromov", name: "Abbos Ikromov", pos: "leadLab", dept: "laboratory" },
  { slug: "miraziz-miratxamov", name: "Miraziz Miratxamov", pos: "specLab", dept: "laboratory" },
  { slug: "zilola-tursunbaeva", name: "Zilola Tursunbaeva", pos: "specLab", dept: "laboratory" },
  { slug: "munisa-abdumavlonova", name: "Munisa Abdumavlonova", pos: "specLab", dept: "laboratory" },
  { slug: "xamidulla-madjidov", name: "Xamidulla Madjidov", pos: "techLab", dept: "laboratory" },
];

const PARTNERS = [
  { name: "Art Mebel", logo: "/images/partners/art-mebel.png", order: 1 },
  { name: "Korzinka", logo: "/images/partners/korzinka.jpg", order: 2 },
  { name: "O'zTTM", logo: "/images/partners/ozttm.png", order: 3 },
  { name: "Discover", logo: "/images/partners/discover.jpg", order: 4 },
];

const NEWS = [
  {
    slug: "akkreditatsiya-guvohnomalari-2027",
    publishedAt: new Date("2026-02-10"),
    image: "/images/certificates/certification-body.jpeg",
    uz: {
      title: "Akkreditatsiya guvohnomalarimiz 2027 yilgacha amal qiladi",
      summary: "Sertifikatlash organi va sinov laboratoriyasi O'ZAK guvohnomalari yangilangan muddatlar bilan amalda.",
      body: "\"Standart and Quality Assessment Group\" MChJ sertifikatlash organi O'ZAK.MS.0052 raqamli guvohnoma asosida O'z DSt ISO/IEC 17065:2015 standarti bo'yicha akkreditatsiyalangan. Guvohnoma 2027 yil 11 yanvargacha amal qiladi.\nSinov laboratoriyamiz esa O'ZAK.SL.0162 raqamli guvohnoma asosida O'z DSt ISO/IEC 17025:2019 standarti bo'yicha akkreditatsiyalangan bo'lib, guvohnoma 2027 yil 10 yanvargacha amal qiladi.\nAkkreditatsiya holatini O'zbekiston akkreditatsiya markazining rasmiy sayti akkred.uz orqali tekshirishingiz mumkin.",
    },
    ru: {
      title: "Наши аттестаты аккредитации действуют до 2027 года",
      summary: "Аттестаты O'ZAK органа по сертификации и испытательной лаборатории действительны.",
      body: "Орган по сертификации ООО «Standart and Quality Assessment Group» аккредитован по стандарту O'z DSt ISO/IEC 17065:2015 на основании аттестата O'ZAK.MS.0052. Аттестат действует до 11 января 2027 года.\nИспытательная лаборатория аккредитована по стандарту O'z DSt ISO/IEC 17025:2019 на основании аттестата O'ZAK.SL.0162, который действует до 10 января 2027 года.\nСтатус аккредитации можно проверить на официальном сайте Центра аккредитации Узбекистана akkred.uz.",
    },
    en: {
      title: "Our accreditation certificates are valid until 2027",
      summary: "O'ZAK certificates of the certification body and the testing laboratory remain in force.",
      body: "The certification body of Standart and Quality Assessment Group LLC is accredited to O'z DSt ISO/IEC 17065:2015 under certificate O'ZAK.MS.0052, valid until 11 January 2027.\nOur testing laboratory is accredited to O'z DSt ISO/IEC 17025:2019 under certificate O'ZAK.SL.0162, valid until 10 January 2027.\nAccreditation status can be verified on the official website of the Uzbek Accreditation Centre, akkred.uz.",
    },
  },
  {
    slug: "yangi-veb-sayt-ishga-tushdi",
    publishedAt: new Date("2026-03-02"),
    image: "/images/logo/logo-black.jpg",
    uz: {
      title: "SQA Group yangi veb-sayti ishga tushdi",
      summary: "Yangilangan saytda xizmatlar, jamoa va akkreditatsiya ma'lumotlari uch tilda taqdim etilgan.",
      body: "SQA Group rasmiy veb-sayti to'liq yangilandi. Endi saytda sertifikatlash organi, sinov laboratoriyalari, akkreditatsiya sohalari va jamoamiz haqidagi ma'lumotlar o'zbek, rus va ingliz tillarida mavjud.\nShuningdek, saytda sertifikatlash sxemalari, moliyalashtirish manbalari hamda shikoyat va takliflar bo'limi joylashtirilgan.\nTakliflaringizni info@sqa.uz manziliga yuborishingiz mumkin.",
    },
    ru: {
      title: "Запущен новый сайт SQA Group",
      summary: "На обновлённом сайте информация об услугах, команде и аккредитации доступна на трёх языках.",
      body: "Официальный сайт SQA Group полностью обновлён. Теперь информация об органе по сертификации, испытательных лабораториях, областях аккредитации и нашей команде доступна на узбекском, русском и английском языках.\nНа сайте также размещены схемы сертификации, источники финансирования и раздел жалоб и предложений.\nСвои предложения вы можете направить на info@sqa.uz.",
    },
    en: {
      title: "The new SQA Group website is live",
      summary: "The refreshed site presents our services, team and accreditation details in three languages.",
      body: "The official SQA Group website has been fully redesigned. Information about the certification body, testing laboratories, accreditation scopes and our team is now available in Uzbek, Russian and English.\nThe site also covers certification schemes, sources of financing, and an appeals and complaints section.\nSend your feedback to info@sqa.uz.",
    },
  },
  {
    slug: "sertifikatlash-jarayoni-qanday-otadi",
    publishedAt: new Date("2026-04-15"),
    image: "/images/office/office.jpg",
    uz: {
      title: "Mahsulot sertifikatlash jarayoni qanday o'tadi?",
      summary: "Arizadan sertifikat olishgacha — besh bosqichli jarayon haqida qisqacha.",
      body: "Mahsulotni sertifikatlashtirish besh asosiy bosqichdan iborat: ariza topshirish va hujjatlarni ko'rib chiqish, namuna olish, akkreditatsiyalangan laboratoriyada sinovlar, natijalarni baholash va sertifikat berish.\nSertifikat berilgandan so'ng inspeksiya nazorati o'tkazilib, mahsulot talablariga muvofiqligi davriy ravishda tasdiqlanadi.\nMos sertifikatlash sxemasini tanlash bo'yicha mutaxassislarimiz bepul maslahat berishadi.",
    },
    ru: {
      title: "Как проходит сертификация продукции?",
      summary: "От заявки до сертификата — кратко о пяти этапах процесса.",
      body: "Сертификация продукции состоит из пяти основных этапов: подача заявки и рассмотрение документов, отбор образцов, испытания в аккредитованной лаборатории, оценка результатов и выдача сертификата.\nПосле выдачи сертификата проводится инспекционный контроль, периодически подтверждающий соответствие продукции требованиям.\nНаши специалисты бесплатно проконсультируют по выбору подходящей схемы сертификации.",
    },
    en: {
      title: "How does product certification work?",
      summary: "From application to certificate — the five steps of the process in brief.",
      body: "Product certification consists of five main steps: application and document review, sampling, testing in an accredited laboratory, evaluation of results, and certificate issuance.\nAfter the certificate is issued, surveillance is carried out to periodically confirm that the product continues to meet the requirements.\nOur specialists provide free advice on choosing the most suitable certification scheme.",
    },
  },
];

async function main() {
  /* admin user */
  const email = (process.env.ADMIN_EMAIL ?? "sqa_admin").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "adminsqa1";
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await hash(password, 10) },
    create: { email, passwordHash: await hash(password, 10), name: "SQA Admin" },
  });

  /* staff */
  for (let i = 0; i < STAFF.length; i++) {
    const s = STAFF[i];
    const pos = POS[s.pos];
    await prisma.staff.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        photoUrl: `/images/team/${s.slug}.jpg`,
        department: s.dept,
        order: i + 1,
        published: true,
        translations: {
          create: (["uz", "ru", "en"] as const).map((locale) => ({
            locale,
            name: s.name,
            position: pos[locale],
          })),
        },
      },
    });
  }

  /* partners */
  for (const p of PARTNERS) {
    const existing = await prisma.partner.findFirst({
      where: { translations: { some: { name: p.name } } },
    });
    if (!existing) {
      await prisma.partner.create({
        data: {
          logoUrl: p.logo,
          order: p.order,
          published: true,
          translations: {
            create: (["uz", "ru", "en"] as const).map((locale) => ({ locale, name: p.name })),
          },
        },
      });
    }
  }

  /* news */
  for (const n of NEWS) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        slug: n.slug,
        imageUrl: n.image,
        status: "published",
        publishedAt: n.publishedAt,
        translations: {
          create: (["uz", "ru", "en"] as const).map((locale) => ({
            locale,
            title: n[locale].title,
            summary: n[locale].summary,
            body: n[locale].body,
          })),
        },
      },
    });
  }

  console.log("Seed complete:", {
    staff: await prisma.staff.count(),
    news: await prisma.news.count(),
    partners: await prisma.partner.count(),
    admins: await prisma.adminUser.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
