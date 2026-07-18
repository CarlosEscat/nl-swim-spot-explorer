import type { Locale } from "@/lib/i18n";

/**
 * Long-form informational pages ("gidsen") rendered at /info/[gids].
 * Content lives here rather than in the UI dictionaries: these are articles,
 * not interface strings. Facts are kept general and point readers to the
 * official channels (zwemwater.nl, on-site signage) for current advice.
 */

export interface GuideContent {
  title: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
}

export interface Guide {
  slug: string;
  content: Record<Locale, GuideContent>;
}

export const GUIDES: Guide[] = [
  {
    slug: "blauwalg",
    content: {
      nl: {
        title: "Blauwalg: herkennen, risico's en waarschuwingen",
        metaDescription:
          "Wat is blauwalg, hoe herken je het en wat betekenen de waarschuwingen? Uitleg over blauwalg in Nederlands zwemwater en waar je actuele adviezen vindt.",
        intro:
          "Blauwalg is in de zomer de meest voorkomende reden dat officiële zwemlocaties in Nederland een waarschuwing of negatief zwemadvies krijgen. Op deze pagina lees je wat blauwalg is, hoe je het herkent en wat de officiële adviezen betekenen.",
        sections: [
          {
            heading: "Wat is blauwalg?",
            paragraphs: [
              "Blauwalg is geen alg maar een verzamelnaam voor cyanobacteriën: bacteriën die van nature in zoet water voorkomen. Bij warm, stilstaand en voedselrijk water — typisch in de zomermaanden — kunnen ze explosief groeien en een drijflaag vormen. Sommige soorten produceren daarbij gifstoffen (toxines).",
              "Een bloei is vaak zichtbaar als een groene tot blauwgroene, olieachtige laag of als slierten in het water, soms met een muffe geur. Maar let op: blauwalg is niet altijd met het blote oog te zien, en niet elke groene laag is blauwalg. Vaar daarom nooit blind op wat je zelf ziet.",
            ],
          },
          {
            heading: "Wat kan blauwalg bij je doen?",
            paragraphs: [
              "Contact met water waarin blauwalg bloeit kan huidirritatie en jeuk veroorzaken. Wie water binnenkrijgt kan last krijgen van maag- en darmklachten, hoofdpijn of grieperige verschijnselen. De klachten zijn meestal mild en gaan vanzelf over, maar kunnen vervelender uitpakken bij kinderen, die sneller water binnenkrijgen.",
              "Voor honden is blauwalg extra gevaarlijk: zij drinken het water en likken hun vacht schoon. Laat je hond niet zwemmen in water met een blauwalgwaarschuwing. Heb je na het zwemmen aanhoudende klachten, neem dan contact op met je huisarts en meld dat je in oppervlaktewater hebt gezwommen.",
            ],
          },
          {
            heading: "Waarschuwing, negatief zwemadvies of zwemverbod",
            paragraphs: [
              "De provincies controleren officiële zwemlocaties tijdens het badseizoen (1 mei – 1 oktober) en geven bij blauwalg een maatregel af die je op de borden bij de zwemplek en op zwemwater.nl terugvindt. Een waarschuwing betekent: er is blauwalg aangetroffen, zwemmen kan klachten geven. Een negatief zwemadvies is dringender: zwemmen wordt afgeraden. Bij een zwemverbod mag je er niet zwemmen.",
              "Op deze site zie je blauwalg-maatregelen als een paars label bij de zwemplek, op de kaart als een paarse ring om de speld, en je kunt plekken met blauwalg verbergen met het filter 'Verberg blauwalg'. De gegevens komen van de officiële zwemwater.nl-publicaties en worden tijdens het badseizoen dagelijks ververst.",
            ],
          },
          {
            heading: "Zelf het risico beperken",
            paragraphs: [
              "Check vóór je gaat de actuele status van de zwemplek en kijk ter plaatse altijd op de borden — de situatie kan per dag verschillen. Vermijd water met drijflagen of slierten, douche na het zwemmen, en kies bij twijfel een andere plek: met honderden officiële zwemlocaties is er bijna altijd een schoon alternatief in de buurt.",
            ],
          },
        ],
        faqs: [
          {
            question: "Hoe herken ik blauwalg?",
            answer:
              "Vaak als een groene tot blauwgroene, olieachtige drijflaag of slierten in het water, soms met een muffe geur. Blauwalg is echter niet altijd zichtbaar — vertrouw daarom op de officiële waarschuwingen op de borden bij de zwemplek en op zwemwater.nl, niet alleen op je eigen ogen.",
          },
          {
            question: "Is zwemmen met blauwalg gevaarlijk?",
            answer:
              "Contact kan huidirritatie geven; water binnenkrijgen kan leiden tot maag- en darmklachten, hoofdpijn of grieperige verschijnselen. Meestal zijn de klachten mild en tijdelijk. Voor honden is blauwalg gevaarlijker — laat ze niet zwemmen of drinken bij een waarschuwing.",
          },
          {
            question: "Wanneer is er blauwalg in Nederland?",
            answer:
              "Vooral in de zomermaanden (juni t/m september), bij aanhoudend warm weer in stilstaand of langzaam stromend zoet water zoals plassen en meren. Na een periode van hitte neemt het aantal waarschuwingen meestal snel toe.",
          },
          {
            question: "Waar vind ik actuele blauwalgwaarschuwingen?",
            answer:
              "Op de borden bij de officiële zwemlocatie en op zwemwater.nl. Deze site toont dezelfde officiële maatregelen per zwemplek, tijdens het badseizoen dagelijks ververst, met een paars blauwalg-label en een kaartfilter.",
          },
        ],
      },
      en: {
        title: "Blue-green algae: how to spot it, risks and warnings",
        metaDescription:
          "What is blue-green algae (blauwalg), how do you recognise it and what do the warnings mean? A guide to algae in Dutch swimming water and where to find current advisories.",
        intro:
          "Blue-green algae (Dutch: blauwalg) is the most common reason official Dutch swimming locations get a warning or negative swimming advice in summer. This page explains what it is, how to recognise it and what the official advisories mean.",
        sections: [
          {
            heading: "What is blue-green algae?",
            paragraphs: [
              "Blue-green algae is not actually an algae but a group of cyanobacteria that occur naturally in fresh water. In warm, still, nutrient-rich water — typically in the summer months — they can multiply explosively and form a floating layer. Some species produce toxins while doing so.",
              "A bloom often shows as a green to blue-green, oily-looking layer or streaks in the water, sometimes with a musty smell. But beware: blue-green algae is not always visible to the naked eye, and not every green layer is blue-green algae. Never rely on what you can see alone.",
            ],
          },
          {
            heading: "What can it do to you?",
            paragraphs: [
              "Contact with blooming water can cause skin irritation and itching. Swallowing water can lead to stomach and intestinal complaints, headache or flu-like symptoms. Complaints are usually mild and pass on their own, but children swallow water more easily and are more at risk.",
              "For dogs, blue-green algae is considerably more dangerous: they drink the water and lick their fur clean. Do not let your dog swim in water with an algae warning. If you have persistent complaints after swimming, contact your doctor and mention that you swam in open water.",
            ],
          },
          {
            heading: "Warning, negative advice or ban",
            paragraphs: [
              "The provinces monitor official swimming locations during the bathing season (1 May – 1 October) and issue measures you will find on the signs at the water and on zwemwater.nl. A warning means algae has been found and swimming may cause complaints. Negative swimming advice is more urgent: swimming is advised against. A swimming ban means swimming is not allowed.",
              "On this site, algae measures show as a violet label on the spot, a violet ring around the map pin, and you can hide affected spots with the 'Hide algae warnings' filter. The data comes from the official zwemwater.nl publications and is refreshed daily during the bathing season.",
            ],
          },
          {
            heading: "Reducing the risk yourself",
            paragraphs: [
              "Check the current status of the spot before you go and always read the on-site signs — the situation can change from day to day. Avoid water with floating layers or streaks, shower after swimming, and when in doubt pick another spot: with hundreds of official locations there is almost always a clean alternative nearby.",
            ],
          },
        ],
        faqs: [
          {
            question: "How do I recognise blue-green algae?",
            answer:
              "Often as a green to blue-green, oily-looking floating layer or streaks, sometimes with a musty smell. It is not always visible though — rely on the official warnings on the signs at the swimming spot and on zwemwater.nl, not just on your own eyes.",
          },
          {
            question: "Is swimming with blue-green algae dangerous?",
            answer:
              "Contact can cause skin irritation; swallowing water can lead to stomach complaints, headache or flu-like symptoms. Complaints are usually mild and temporary. For dogs it is more dangerous — keep them out of the water during a warning.",
          },
          {
            question: "When does blue-green algae occur in the Netherlands?",
            answer:
              "Mainly in the summer months (June to September), during sustained warm weather in still or slow-moving fresh water such as lakes and recreational ponds. After a heat wave the number of warnings usually rises quickly.",
          },
          {
            question: "Where do I find current algae warnings?",
            answer:
              "On the signs at the official swimming location and on zwemwater.nl. This site shows the same official measures per spot, refreshed daily during the bathing season, with a violet algae label and a map filter.",
          },
        ],
      },
    },
  },
  {
    slug: "eu-zwemwaterclassificatie",
    content: {
      nl: {
        title: "De EU-zwemwaterclassificatie uitgelegd",
        metaDescription:
          "Wat betekent de jaarlijkse EU-beoordeling van zwemwater — uitstekend, goed, aanvaardbaar of slecht? Uitleg over de blauwe borden en hoe de classificatie tot stand komt.",
        intro:
          "Elke officiële zwemlocatie in Europa krijgt jaarlijks een kwaliteitsbeoordeling volgens de Europese Zwemwaterrichtlijn: uitstekend, goed, aanvaardbaar of slecht. Het is de beoordeling die je op de blauwe borden bij het water ziet — en bij elke zwemplek op deze site.",
        sections: [
          {
            heading: "Hoe komt de beoordeling tot stand?",
            paragraphs: [
              "Tijdens het badseizoen meten waterbeheerders regelmatig de concentratie van twee bacteriegroepen die op ontlasting wijzen: E. coli en intestinale enterokokken. De classificatie wordt berekend over de metingen van de laatste vier badseizoenen samen — één slechte zomer drukt de beoordeling dus niet meteen, en één goede zomer herstelt hem ook niet meteen.",
              "De uitkomst is een van vier klassen: uitstekend, goed, aanvaardbaar of slecht. Locaties met de klasse 'slecht' krijgen doorgaans een negatief zwemadvies of maatregelen om de kwaliteit te verbeteren. Nederland scoort in Europese vergelijkingen traditioneel hoog: het overgrote deel van de Nederlandse locaties is 'uitstekend' of 'goed'.",
            ],
          },
          {
            heading: "Classificatie versus actuele waarschuwingen",
            paragraphs: [
              "De EU-classificatie zegt iets over de structurele kwaliteit over meerdere jaren, niet over vandaag. Een locatie met 'uitstekend' kan tijdelijk een blauwalgwaarschuwing hebben, en omgekeerd. Kijk daarom altijd naar allebei: de jaarbeoordeling voor de betrouwbaarheid op lange termijn, en de actuele maatregelen voor de situatie van dit moment. Op deze site staan ze naast elkaar op elke zwemplek-pagina.",
              "De beoordeling wordt jaarlijks gepubliceerd door het Europees Milieuagentschap (EEA). De publicatie loopt enkele maanden achter op het badseizoen; daarom staat het beoordelingsjaar altijd bij het label vermeld.",
            ],
          },
          {
            heading: "Waarvoor gebruikt deze site de classificatie?",
            paragraphs: [
              "Naast het tonen van de beoordeling per zwemplek gebruikt deze site de classificatie als basis voor de selectie 'Beste zwemwater': officiële locaties met de beoordeling 'uitstekend' en de meeste voorzieningen, per provincie. Zo vind je snel de bewezen schoonste plekken in jouw regio.",
            ],
          },
        ],
        faqs: [
          {
            question: "Wat betekent 'uitstekend' op het blauwe bord?",
            answer:
              "Dat de bacteriologische waterkwaliteit over de laatste vier badseizoenen ruim binnen de strengste norm van de Europese Zwemwaterrichtlijn viel. Het is de hoogste van de vier klassen: uitstekend, goed, aanvaardbaar en slecht.",
          },
          {
            question: "Betekent 'uitstekend' dat ik er vandaag veilig kan zwemmen?",
            answer:
              "Niet per se. De classificatie gaat over meerdere jaren; actuele problemen zoals blauwalg staan er los van. Check daarom ook altijd de actuele maatregelen op de borden of op zwemwater.nl — op deze site zie je beide naast elkaar.",
          },
          {
            question: "Waarom staat er een ouder jaartal bij de beoordeling?",
            answer:
              "Het Europees Milieuagentschap publiceert de classificatie enkele maanden na afloop van het badseizoen. De meest recente officiële beoordeling kan daardoor over een eerder seizoen gaan; het jaartal bij het label maakt dat transparant.",
          },
        ],
      },
      en: {
        title: "The EU bathing water classification explained",
        metaDescription:
          "What does the annual EU bathing water rating mean — excellent, good, sufficient or poor? How the classification works and what the blue signs at Dutch swimming spots tell you.",
        intro:
          "Every official bathing location in Europe receives an annual quality rating under the European Bathing Water Directive: excellent, good, sufficient or poor. It is the rating you see on the blue signs at the water — and on every spot page on this site.",
        sections: [
          {
            heading: "How is the rating determined?",
            paragraphs: [
              "During the bathing season, water authorities regularly measure two groups of bacteria that indicate faecal contamination: E. coli and intestinal enterococci. The classification is calculated over the measurements of the last four bathing seasons combined — so one bad summer does not immediately drag the rating down, and one good summer does not immediately restore it.",
              "The result is one of four classes: excellent, good, sufficient or poor. Locations rated 'poor' typically get negative swimming advice or improvement measures. The Netherlands traditionally scores high in European comparisons: the vast majority of Dutch locations are rated 'excellent' or 'good'.",
            ],
          },
          {
            heading: "Classification versus current advisories",
            paragraphs: [
              "The EU classification reflects structural quality over several years, not today's conditions. A location rated 'excellent' can temporarily have a blue-green algae warning, and vice versa. Always look at both: the annual rating for long-term reliability, and the current measures for right now. This site shows them side by side on every spot page.",
              "The rating is published annually by the European Environment Agency (EEA). Publication lags the bathing season by a few months, which is why the rating year is always shown next to the label.",
            ],
          },
          {
            heading: "How this site uses the classification",
            paragraphs: [
              "Besides showing the rating per spot, this site uses the classification as the basis for the 'Top rated' selection: official locations rated 'excellent' with the best facilities, per province. That way you can quickly find the proven cleanest spots in your region.",
            ],
          },
        ],
        faqs: [
          {
            question: "What does 'excellent' on the blue sign mean?",
            answer:
              "That the bacteriological water quality over the last four bathing seasons was well within the strictest standard of the European Bathing Water Directive. It is the highest of the four classes: excellent, good, sufficient and poor.",
          },
          {
            question: "Does 'excellent' mean it is safe to swim today?",
            answer:
              "Not necessarily. The classification covers several years; current issues such as blue-green algae are separate from it. Always check the current advisories on the signs or on zwemwater.nl — this site shows both side by side.",
          },
          {
            question: "Why does the rating show an older year?",
            answer:
              "The European Environment Agency publishes the classification a few months after the bathing season ends. The most recent official rating can therefore cover an earlier season; the year next to the label makes that transparent.",
          },
        ],
      },
    },
  },
  {
    slug: "veilig-zwemmen",
    content: {
      nl: {
        title: "Veilig zwemmen in open water",
        metaDescription:
          "Veilig buiten zwemmen in Nederland: waarom officiële zwemlocaties, de risico's van rivieren en kanalen, koud water en stroming — en waar je moet opletten.",
        intro:
          "Zwemmen in natuurwater is heerlijk, maar open water is geen zwembad. De meeste incidenten gebeuren buiten de officiële zwemlocaties: in rivieren, kanalen en bij bruggen en sluizen. Met een paar vuistregels zwem je een stuk veiliger.",
        sections: [
          {
            heading: "Kies een officiële zwemlocatie",
            paragraphs: [
              "Officiële zwemlocaties zijn er niet voor niets: het water wordt er tijdens het badseizoen gecontroleerd, de bodem en oevers zijn beoordeeld op veiligheid, er zijn geen vaargeulen en bij problemen worden waarschuwingen afgegeven. Nederland telt honderden van deze locaties — vrijwel altijd is er één in de buurt.",
              "Bekende maar onofficiële zwemplekken worden op deze site duidelijk gemarkeerd: de waterkwaliteit wordt daar niet gecontroleerd en er is geen toezicht. Zwemmen is er op eigen risico.",
            ],
          },
          {
            heading: "Rivieren en kanalen: niet doen",
            paragraphs: [
              "Rijkswaterstaat raadt zwemmen in rivieren zoals de Waal, de IJssel en de Maas sterk af, en bij vaarwegen, bruggen, sluizen en stuwen is het verboden. De stroming is sterker dan hij lijkt: bij kribben ontstaan draaikolken en neerwaartse stroming waar zelfs geoefende zwemmers niet tegenop zwemmen, en schepen veroorzaken zuiging die je onverwacht meetrekt.",
              "Ook in kanalen ligt het gevaar in scheepvaart en steile, gladde oevers waar je moeilijk uit het water komt. De ranglijsten en kaart op deze site bevatten daarom vrijwel uitsluitend plassen, meren en zeestranden.",
            ],
          },
          {
            heading: "Koud water en je lichaam",
            paragraphs: [
              "Open water is kouder dan het lijkt, ook op warme dagen. Bij plotselinge onderdompeling in koud water kan koudeschok optreden: een onwillekeurige happen naar adem en hyperventilatie, precies wat je onder water niet wilt. Ga rustig te water, blijf de eerste minuten dicht bij de kant en let op de actuele watertemperatuur — die zie je op deze site per zwemplek, gemeten door het dichtstbijzijnde Rijkswaterstaat-meetstation.",
            ],
          },
          {
            heading: "Vuistregels",
            paragraphs: [
              "Zwem nooit alleen en houd kinderen altijd binnen handbereik — verdrinking is stil en snel. Drink geen alcohol voor het zwemmen. Check vooraf de waterkwaliteit en ter plaatse de borden. Zwem haaks op de stroming naar de kant als je toch wordt meegevoerd, en raak niet in paniek: drijven en om hulp roepen is effectiever dan tegen de stroming in vechten.",
            ],
          },
        ],
        faqs: [
          {
            question: "Waarom is zwemmen in rivieren gevaarlijk?",
            answer:
              "Door sterke en onvoorspelbare stroming (vooral bij kribben), zuiging van passerende schepen en koud water. Rijkswaterstaat raadt zwemmen in rivieren sterk af; bij vaarwegen, bruggen en sluizen is het verboden.",
          },
          {
            question: "Wat is koudeschok?",
            answer:
              "De reactie van je lichaam op plotselinge onderdompeling in koud water: naar adem happen en hyperventileren, waardoor je water binnen kunt krijgen. Ga daarom rustig te water en blijf de eerste minuten dicht bij de kant, ook op warme dagen.",
          },
          {
            question: "Is een onofficiële zwemplek onveilig?",
            answer:
              "Niet per definitie, maar er is geen kwaliteitscontrole, geen veiligheidsbeoordeling van bodem en oevers en geen toezicht. Op deze site zijn onofficiële plekken duidelijk gemarkeerd; zwemmen is er op eigen risico. Kies bij twijfel een officiële locatie in de buurt.",
          },
          {
            question: "Waar zie ik de actuele watertemperatuur?",
            answer:
              "Op elke zwemplek-pagina op deze site, gemeten door het dichtstbijzijnde live meetstation van Rijkswaterstaat, inclusief het verloop van de afgelopen twee weken.",
          },
        ],
      },
      en: {
        title: "Swimming safely in open water",
        metaDescription:
          "How to swim safely outdoors in the Netherlands: why official locations matter, the dangers of rivers and canals, cold water shock and currents — and what to watch for.",
        intro:
          "Swimming in natural water is wonderful, but open water is not a pool. Most incidents happen outside official swimming locations: in rivers, canals and near bridges and locks. A few rules of thumb make open-water swimming a lot safer.",
        sections: [
          {
            heading: "Pick an official swimming location",
            paragraphs: [
              "Official locations exist for a reason: the water is monitored during the bathing season, the bottom and banks have been assessed for safety, there are no shipping lanes, and warnings are issued when problems occur. The Netherlands has hundreds of them — there is almost always one nearby.",
              "Well-known but unofficial swim spots are clearly flagged on this site: water quality is not monitored there and there is no supervision. Swimming is at your own risk.",
            ],
          },
          {
            heading: "Rivers and canals: don't",
            paragraphs: [
              "Rijkswaterstaat strongly advises against swimming in rivers such as the Waal, IJssel and Maas, and near shipping lanes, bridges, locks and weirs it is prohibited. Currents are stronger than they look: groynes create eddies and downward currents that even trained swimmers cannot beat, and passing ships create suction that can pull you under unexpectedly.",
              "In canals the danger lies in shipping traffic and steep, slippery banks that make it hard to get out. The rankings and map on this site therefore consist almost entirely of lakes, recreational ponds and sea beaches.",
            ],
          },
          {
            heading: "Cold water and your body",
            paragraphs: [
              "Open water is colder than it looks, even on hot days. Sudden immersion can trigger cold water shock: an involuntary gasp and hyperventilation — exactly what you do not want under water. Enter the water slowly, stay close to the shore for the first minutes, and check the current water temperature — shown on every spot page on this site, measured by the nearest Rijkswaterstaat station.",
            ],
          },
          {
            heading: "Rules of thumb",
            paragraphs: [
              "Never swim alone and keep children within arm's reach — drowning is silent and fast. Do not drink alcohol before swimming. Check the water quality beforehand and read the signs on site. If a current does carry you off, swim across it towards the shore rather than against it, and stay calm: floating and calling for help works better than fighting the current.",
            ],
          },
        ],
        faqs: [
          {
            question: "Why is swimming in rivers dangerous?",
            answer:
              "Because of strong, unpredictable currents (especially near groynes), suction from passing ships and cold water. Rijkswaterstaat strongly advises against swimming in rivers; near shipping lanes, bridges and locks it is prohibited.",
          },
          {
            question: "What is cold water shock?",
            answer:
              "Your body's reaction to sudden immersion in cold water: gasping and hyperventilating, which can make you inhale water. Enter the water slowly and stay close to the shore for the first few minutes, even on hot days.",
          },
          {
            question: "Are unofficial swim spots unsafe?",
            answer:
              "Not by definition, but there is no quality monitoring, no safety assessment of the bottom and banks, and no supervision. Unofficial spots are clearly flagged on this site; swimming there is at your own risk. When in doubt, pick a nearby official location.",
          },
          {
            question: "Where can I see the current water temperature?",
            answer:
              "On every spot page on this site, measured by the nearest live Rijkswaterstaat station, including the trend over the past two weeks.",
          },
        ],
      },
    },
  },
];

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
