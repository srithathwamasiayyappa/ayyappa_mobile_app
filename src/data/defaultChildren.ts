// Automatically exported from website defaultScriptures.js
export interface ChildTypeItem {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

export function hasSubcategoryTypes(id: string, slug?: string, rawId?: string | number): boolean {
  const s = `${id || ''} ${slug || ''} ${rawId || ''}`.toLowerCase().trim();
  const idStr = String(rawId || id || '').toLowerCase().trim();

  if (DEFAULT_CHILDREN[idStr] && DEFAULT_CHILDREN[idStr].length > 0) {
    return true;
  }

  return /ganapa|vignesh|vinayak|mahaganapati|subramanya|subrahmanya|murugan|dharma-sastha|sastha|poorvaangam|ashtottara|ashtothram|satyanarayana|varalakshmi|kedareswara|gomatha|devi-pooja|harathi|sharanu|bhajan/.test(s);
}

export const DEFAULT_CHILDREN: Record<string, ChildTypeItem[]> = {
  "93": [
    {
      "id": "93_1",
      "slug": "saranam-ganesha",
      "title": "శరణం గణేశ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_2",
      "slug": "chanda-pranchadude-pindibomma-athade",
      "title": "చండా ప్రంచడుడే పిండిబొమ్మ అతడే",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_3",
      "slug": "kannimoola-ganapathivayya",
      "title": "కన్నిమూల గణపతివయ్యా",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "ganapathi-bhajanalu": [
    {
      "id": "93_1",
      "slug": "saranam-ganesha",
      "title": "శరణం గణేశ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_2",
      "slug": "chanda-pranchadude-pindibomma-athade",
      "title": "చండా ప్రంచడుడే పిండిబొమ్మ అతడే",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_3",
      "slug": "kannimoola-ganapathivayya",
      "title": "కన్నిమూల గణపతివయ్యా",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "249": [
    {
      "id": "93_1",
      "slug": "saranam-ganesha",
      "title": "శరణం గణేశ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_2",
      "slug": "chanda-pranchadude-pindibomma-athade",
      "title": "చండా ప్రంచడుడే పిండిబొమ్మ అతడే",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_3",
      "slug": "kannimoola-ganapathivayya",
      "title": "కన్నిమూల గణపతివయ్యా",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "vinayaka-bhajana-keerthanalu": [
    {
      "id": "93_1",
      "slug": "saranam-ganesha",
      "title": "శరణం గణేశ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_2",
      "slug": "chanda-pranchadude-pindibomma-athade",
      "title": "చండా ప్రంచడుడే పిండిబొమ్మ అతడే",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "93_3",
      "slug": "kannimoola-ganapathivayya",
      "title": "కన్నిమూల గణపతివయ్యా",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "22": [
    { id: "93", slug: "ganapathi-bhajanalu", title: "గణపతి భజనలు", imageUrl: "/images/deities/card_ganesha.jpg" },
    { id: "94", slug: "om-guru-natha", title: "ఓం గురు నాథ", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "95", slug: "saayamkaala-samayamlo", title: "సాయంకాల సమయంలో", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "96", slug: "dandalaamma-neeku-dandaalama", title: "దండాలమ్మా నీకు దండాలమ", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "97", slug: "ambaparameshwari-akhilandeshwari", title: "అంబపరమేశ్వరి అఖిలాండేశ్వరి", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "98", slug: "anjaneya-keerthana-eemira-dora", title: "ఆంజనేయ కీర్తన ఏమిరా దొర", imageUrl: "/images/deities/hanuman.jpg" },
    { id: "99", slug: "guruvayoorappa", title: "గురువాయూరప్ప", imageUrl: "/images/deities/card_vishnu.jpg" },
    { id: "100", slug: "pazhanimalai-swamiki", title: "పళనిమలై స్వామికి", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "101", slug: "umamaheshwara-kumara-gurave-udipi-subramanya", title: "ఉమామహేశ్వర కుమార గురవే ఉడిపి సుబ్రమణ్య", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "102", slug: "swami-ayyappa-swami-ayyappa", title: "స్వామి అయ్యప్పా స్వామి అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "103", slug: "tulasidhalalatho-tulatugudamante", title: "తులసిదళాలతో తులతూగుదామంటే", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "104", slug: "vacche-vacche-vacche-vacche-ayyappa", title: "వచ్చే వచ్చే వచ్చే వచ్చే అయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "105", slug: "ekkada-choosina-neeve-ayyappa", title: "ఎక్కడ చూసినా నీవే అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "106", slug: "sri-dharmasastha-paahimaam", title: "శ్రీధర్మ శాస్తా పాహిమాం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "107", slug: "bhagavan-sharanam-bhagavathi-sharanam", title: "భగవాన్ శరణం భగవతి శరణం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "108", slug: "abhishekamu-cheddamu-rarandi", title: "అభిషేకము చేద్దము రారండి(అభిషేకము పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "109", slug: "annadaana-prabhuve-sharanamayyappa", title: "అన్నదాన ప్రభువే శరణమయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "110", slug: "sabarimalai-nauka-saagi-pothunnadi", title: "శబరిమలై నౌక సాగి పోతున్నది", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "111", slug: "ashtadasha-sopana-paata-padi-paata", title: "అష్టాదశ సోపాన పాట (పడి పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" }
  ],
  "bhajana-keerthanalu": [
    { id: "93", slug: "ganapathi-bhajanalu", title: "గణపతి భజనలు", imageUrl: "/images/deities/card_ganesha.jpg" },
    { id: "94", slug: "om-guru-natha", title: "ఓం గురు నాథ", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "95", slug: "saayamkaala-samayamlo", title: "సాయంకాల సమయంలో", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "96", slug: "dandalaamma-neeku-dandaalama", title: "దండాలమ్మా నీకు దండాలమ", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "97", slug: "ambaparameshwari-akhilandeshwari", title: "అంబపరమేశ్వరి అఖిలాండేశ్వరి", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "98", slug: "anjaneya-keerthana-eemira-dora", title: "ఆంజనేయ కీర్తన ఏమిరా దొర", imageUrl: "/images/deities/hanuman.jpg" },
    { id: "99", slug: "guruvayoorappa", title: "గురువాయూరప్ప", imageUrl: "/images/deities/card_vishnu.jpg" },
    { id: "100", slug: "pazhanimalai-swamiki", title: "పళనిమలై స్వామికి", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "101", slug: "umamaheshwara-kumara-gurave-udipi-subramanya", title: "ఉమామహేశ్వర కుమార గురవే ఉడిపి సుబ్రమణ్య", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "102", slug: "swami-ayyappa-swami-ayyappa", title: "స్వామి అయ్యప్పా స్వామి అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "103", slug: "tulasidhalalatho-tulatugudamante", title: "తులసిదళాలతో తులతూగుదామంటే", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "104", slug: "vacche-vacche-vacche-vacche-ayyappa", title: "వచ్చే వచ్చే వచ్చే వచ్చే అయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "105", slug: "ekkada-choosina-neeve-ayyappa", title: "ఎక్కడ చూసినా నీవే అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "106", slug: "sri-dharmasastha-paahimaam", title: "శ్రీధర్మ శాస్తా పాహిమాం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "107", slug: "bhagavan-sharanam-bhagavathi-sharanam", title: "భగవాన్ శరణం భగవతి శరణం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "108", slug: "abhishekamu-cheddamu-rarandi", title: "అభిషేకము చేద్దము రారండి(అభిషేకము పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "109", slug: "annadaana-prabhuve-sharanamayyappa", title: "అన్నదాన ప్రభువే శరణమయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "110", slug: "sabarimalai-nauka-saagi-pothunnadi", title: "శబరిమలై నౌక సాగి పోతున్నది", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "111", slug: "ashtadasha-sopana-paata-padi-paata", title: "అష్టాదశ సోపాన పాట (పడి పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" }
  ],
  "248": [
    { id: "93", slug: "ganapathi-bhajanalu", title: "గణపతి భజనలు", imageUrl: "/images/deities/card_ganesha.jpg" },
    { id: "94", slug: "om-guru-natha", title: "ఓం గురు నాథ", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "95", slug: "saayamkaala-samayamlo", title: "సాయంకాల సమయంలో", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "96", slug: "dandalaamma-neeku-dandaalama", title: "దండాలమ్మా నీకు దండాలమ", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "97", slug: "ambaparameshwari-akhilandeshwari", title: "అంబపరమేశ్వరి అఖిలాండేశ్వరి", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "98", slug: "anjaneya-keerthana-eemira-dora", title: "ఆంజనేయ కీర్తన ఏమిరా దొర", imageUrl: "/images/deities/hanuman.jpg" },
    { id: "99", slug: "guruvayoorappa", title: "గురువాయూరప్ప", imageUrl: "/images/deities/card_vishnu.jpg" },
    { id: "100", slug: "pazhanimalai-swamiki", title: "పళనిమలై స్వామికి", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "101", slug: "umamaheshwara-kumara-gurave-udipi-subramanya", title: "ఉమామహేశ్వర కుమార గురవే ఉడిపి సుబ్రమణ్య", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "102", slug: "swami-ayyappa-swami-ayyappa", title: "స్వామి అయ్యప్పా స్వామి అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "103", slug: "tulasidhalalatho-tulatugudamante", title: "తులసిదళాలతో తులతూగుదామంటే", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "104", slug: "vacche-vacche-vacche-vacche-ayyappa", title: "వచ్చే వచ్చే వచ్చే వచ్చే అయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "105", slug: "ekkada-choosina-neeve-ayyappa", title: "ఎక్కడ చూసినా నీవే అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "106", slug: "sri-dharmasastha-paahimaam", title: "శ్రీధర్మ శాస్తా పాహిమాం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "107", slug: "bhagavan-sharanam-bhagavathi-sharanam", title: "భగవాన్ శరణం భగవతి శరణం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "108", slug: "abhishekamu-cheddamu-rarandi", title: "అభిషేకము చేద్దము రారండి(అభిషేకము పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "109", slug: "annadaana-prabhuve-sharanamayyappa", title: "అన్నదాన ప్రభువే శరణమయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "110", slug: "sabarimalai-nauka-saagi-pothunnadi", title: "శబరిమలై నౌక సాగి పోతున్నది", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "111", slug: "ashtadasha-sopana-paata-padi-paata", title: "అష్టాదశ సోపాన పాట (పడి పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" }
  ],
  "bhagavan-saranam-ayyappa-bhajans": [
    { id: "93", slug: "ganapathi-bhajanalu", title: "గణపతి భజనలు", imageUrl: "/images/deities/card_ganesha.jpg" },
    { id: "94", slug: "om-guru-natha", title: "ఓం గురు నాథ", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "95", slug: "saayamkaala-samayamlo", title: "సాయంకాల సమయంలో", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "96", slug: "dandalaamma-neeku-dandaalama", title: "దండాలమ్మా నీకు దండాలమ", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "97", slug: "ambaparameshwari-akhilandeshwari", title: "అంబపరమేశ్వరి అఖిలాండేశ్వరి", imageUrl: "/images/deities/card_devi.jpg" },
    { id: "98", slug: "anjaneya-keerthana-eemira-dora", title: "ఆంజనేయ కీర్తన ఏమిరా దొర", imageUrl: "/images/deities/hanuman.jpg" },
    { id: "99", slug: "guruvayoorappa", title: "గురువాయూరప్ప", imageUrl: "/images/deities/card_vishnu.jpg" },
    { id: "100", slug: "pazhanimalai-swamiki", title: "పళనిమలై స్వామికి", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "101", slug: "umamaheshwara-kumara-gurave-udipi-subramanya", title: "ఉమామహేశ్వర కుమార గురవే ఉడిపి సుబ్రమణ్య", imageUrl: "/images/deities/card_murugan.jpg" },
    { id: "102", slug: "swami-ayyappa-swami-ayyappa", title: "స్వామి అయ్యప్పా స్వామి అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "103", slug: "tulasidhalalatho-tulatugudamante", title: "తులసిదళాలతో తులతూగుదామంటే", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "104", slug: "vacche-vacche-vacche-vacche-ayyappa", title: "వచ్చే వచ్చే వచ్చే వచ్చే అయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "105", slug: "ekkada-choosina-neeve-ayyappa", title: "ఎక్కడ చూసినా నీవే అయ్యప్పా", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "106", slug: "sri-dharmasastha-paahimaam", title: "శ్రీధర్మ శాస్తా పాహిమాం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "107", slug: "bhagavan-sharanam-bhagavathi-sharanam", title: "భగవాన్ శరణం భగవతి శరణం", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "108", slug: "abhishekamu-cheddamu-rarandi", title: "అభిషేకము చేద్దము రారండి(అభిషేకము పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "109", slug: "annadaana-prabhuve-sharanamayyappa", title: "అన్నదాన ప్రభువే శరణమయ్యప్ప", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "110", slug: "sabarimalai-nauka-saagi-pothunnadi", title: "శబరిమలై నౌక సాగి పోతున్నది", imageUrl: "/images/deities/card_ayyappa.jpg" },
    { id: "111", slug: "ashtadasha-sopana-paata-padi-paata", title: "అష్టాదశ సోపాన పాట (పడి పాట)", imageUrl: "/images/deities/card_ayyappa.jpg" }
  ],
  "20": [
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "81_2",
      "slug": "sri-gomatha-prarthana",
      "title": "శ్రీ గోమాత ప్రార్థన & పూజా విధానం",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    }
  ],
  "sri-gomatha-pooja": [
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "81_2",
      "slug": "sri-gomatha-prarthana",
      "title": "శ్రీ గోమాత ప్రార్థన & పూజా విధానం",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    }
  ],
  "19": [
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    }
  ],
  "sri-devi-pooja": [
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    }
  ],
  "235": [
    {
      "id": "90",
      "slug": "harathi-paata-sri-sabarigirivasa",
      "title": "హారతి పాట (శ్రీ శబరిగిరివాస)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "91",
      "slug": "ayyappa-mangala-harathi-shankaraya-shankaraya",
      "title": "అయ్యప్ప మంగళ హారతి(శంకరాయ శంకరాయ)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "92",
      "slug": "om-mangalam",
      "title": "ఓం మంగళం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "mangala-harathi-vidhanam": [
    {
      "id": "90",
      "slug": "harathi-paata-sri-sabarigirivasa",
      "title": "హారతి పాట (శ్రీ శబరిగిరివాస)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "91",
      "slug": "ayyappa-mangala-harathi-shankaraya-shankaraya",
      "title": "అయ్యప్ప మంగళ హారతి(శంకరాయ శంకరాయ)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "92",
      "slug": "om-mangalam",
      "title": "ఓం మంగళం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "231": [
    {
      "id": "61",
      "slug": "sri-ayyappa-pooja",
      "title": "శ్రీ అయ్యప్ప పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "62",
      "slug": "irumudi",
      "title": "ఇరుముడి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "63",
      "slug": "ayyappaswamy-stotram",
      "title": "అయ్యప్పస్వామి స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "64",
      "slug": "sri-sabarigireeshashtakam",
      "title": "శ్రీ శబరిగిరీశాష్టకమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "65",
      "slug": "hariharathmajashtakam",
      "title": "హరిహరాత్మజాష్టకం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "66",
      "slug": "sri-dharmasastha-bhujanga-stotram",
      "title": "శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "67",
      "slug": "sri-dharmasastha-stotram-sringeri",
      "title": "శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "68",
      "slug": "sri-mahashastha-anugraha-kavacham",
      "title": "శ్రీ మహాశాస్తా అనుగ్రహ కవచం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "69",
      "slug": "sri-dharmasastha-sahasranama-stotram",
      "title": "శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "sri-dharma-sastha-ayyappa-pooja": [
    {
      "id": "61",
      "slug": "sri-ayyappa-pooja",
      "title": "శ్రీ అయ్యప్ప పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "62",
      "slug": "irumudi",
      "title": "ఇరుముడి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "63",
      "slug": "ayyappaswamy-stotram",
      "title": "అయ్యప్పస్వామి స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "64",
      "slug": "sri-sabarigireeshashtakam",
      "title": "శ్రీ శబరిగిరీశాష్టకమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "65",
      "slug": "hariharathmajashtakam",
      "title": "హరిహరాత్మజాష్టకం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "66",
      "slug": "sri-dharmasastha-bhujanga-stotram",
      "title": "శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "67",
      "slug": "sri-dharmasastha-stotram-sringeri",
      "title": "శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "68",
      "slug": "sri-mahashastha-anugraha-kavacham",
      "title": "శ్రీ మహాశాస్తా అనుగ్రహ కవచం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "69",
      "slug": "sri-dharmasastha-sahasranama-stotram",
      "title": "శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "229": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "sri-maha-ganapathi-pooja": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "230": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "sri-subrahmanyeswara-pooja": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "3": [
    {
      "id": "40",
      "slug": "ayyappa-sharanu-gosha-108",
      "title": "అయ్యప్ప శరణు ఘోష 108",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "41",
      "slug": "maargamadhya-sharanomulu",
      "title": "మార్గమధ్య శరణములు",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "42",
      "slug": "sahasra-sharanam-1008-aksharamalika",
      "title": "సహస్ర శరణం 1008(అక్షరమాలిక )",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "6": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "7": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "8": [
    {
      "id": "61",
      "slug": "sri-ayyappa-pooja",
      "title": "శ్రీ అయ్యప్ప పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "62",
      "slug": "irumudi",
      "title": "ఇరుముడి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "63",
      "slug": "ayyappaswamy-stotram",
      "title": "అయ్యప్పస్వామి స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "64",
      "slug": "sri-sabarigireeshashtakam",
      "title": "శ్రీ శబరిగిరీశాష్టకమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "65",
      "slug": "hariharathmajashtakam",
      "title": "హరిహరాత్మజాష్టకం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "66",
      "slug": "sri-dharmasastha-bhujanga-stotram",
      "title": "శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "67",
      "slug": "sri-dharmasastha-stotram-sringeri",
      "title": "శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "68",
      "slug": "sri-mahashastha-anugraha-kavacham",
      "title": "శ్రీ మహాశాస్తా అనుగ్రహ కవచం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "69",
      "slug": "sri-dharmasastha-sahasranama-stotram",
      "title": "శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "11": [
    {
      "id": "90",
      "slug": "harathi-paata-sri-sabarigirivasa",
      "title": "హారతి పాట (శ్రీ శబరిగిరివాస)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "91",
      "slug": "ayyappa-mangala-harathi-shankaraya-shankaraya",
      "title": "అయ్యప్ప మంగళ హారతి(శంకరాయ శంకరాయ)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "92",
      "slug": "om-mangalam",
      "title": "ఓం మంగళం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "21": [
    {
      "id": "70",
      "slug": "sri-vigneshwara-ashtottara-shatanamavali",
      "title": "శ్రీ విఘ్నేశ్వర అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "71",
      "slug": "sri-subrahmanya-ashtottara-shatanamavali",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "72",
      "slug": "sri-ayyappa-ashtottara-shatanamavali",
      "title": "శ్రీ అయ్యప్ప అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "73",
      "slug": "sri-poorna-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పూర్ణా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "74",
      "slug": "sri-pushkala-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పుష్కలా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "75",
      "slug": "sri-shiva-ashtottara-shatanamavali",
      "title": "శ్రీ శివ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "76",
      "slug": "sri-medha-dakshinamurthy-ashtottara-shatanamavali",
      "title": "శ్రీ మేధా దక్షిణామూర్తి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "77",
      "slug": "sri-veerabhadra-ashtottara-shatanamavali",
      "title": "శ్రీ వీరభద్ర స్తోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "78",
      "slug": "sri-vishvaksena-ashtottara-shatanamavali",
      "title": "శ్రీ విష్వక్సేన అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "79",
      "slug": "sri-mahavishnu-ashtottara-shatanamavali",
      "title": "శ్రీ మహావిష్ణు అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "80",
      "slug": "sri-venkateshwara-ashtottara-shatanamavali",
      "title": "శ్రీ వేంకటేశ్వర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "86",
      "slug": "sri-vasavi-kanyakaparameshwari-ashtottaram",
      "title": "శ్రీ వాసవీ కన్యకాపరమేశ్వరీ అష్టోత్తరము",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "87",
      "slug": "sri-anjaneya-ashtottara-shatanamavali",
      "title": "శ్రీ ఆంజనేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/hanuman.jpg"
    },
    {
      "id": "88",
      "slug": "sri-dattatreya-ashtottara-shatanamavali",
      "title": "శ్రీ దత్తాత్రేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "89",
      "slug": "sri-raghavendra-ashtottara-shatanamavali",
      "title": "శ్రీ రాఘవేంద్ర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    }
  ],
  "25": [
    {
      "id": "29",
      "slug": "satyanarayana-adhyayam-1",
      "title": "||అథ ప్రథమాధ్యాయము||",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "30",
      "slug": "satyanarayana-adhyayam-2",
      "title": "అథ ద్వితీయో ధ్యాయః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "26": [
    {
      "id": "34",
      "slug": "varalakshmi-pooja-vidhanam",
      "title": "వరలక్ష్మీ పూజా విధానం",
      "imageUrl": "/images/deities/card_lakshmi.jpg"
    },
    {
      "id": "35",
      "slug": "varalakshmi-vratha-katha",
      "title": "వరలక్ష్మీ వ్రత కథ",
      "imageUrl": "/images/deities/card_lakshmi.jpg"
    }
  ],
  "27": [
    {
      "id": "36",
      "slug": "sri-vinayaka-pooja",
      "title": "శ్రీ వినాయక పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "37",
      "slug": "vinayaka-vratha-katha",
      "title": "వినాయక వ్రత కథ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "28": [
    {
      "id": "38",
      "slug": "kedareswara-pooja",
      "title": "కేదారేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "39",
      "slug": "sri-kedareswara-vratha-katha",
      "title": "శ్రీ కేదారేశ్వర వ్రత కథ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "ganapathi-pooja": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "sri-vigneshwara-ashtottara": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "mahaganapathi": [
    {
      "id": "53",
      "slug": "sri-vigneshwara-pooja",
      "title": "శ్రీ విఘ్నేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "54",
      "slug": "sri-ganesha-pancharatnam",
      "title": "శ్రీ గణేశ పంచరత్నము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "55",
      "slug": "sri-ekadanta-stotram",
      "title": "శ్రీ ఏకదంతస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "56",
      "slug": "sri-sankashta-nashana-ganesha-stotram",
      "title": "శ్రీ సంకష్టనాశన గణేశస్తోత్రము",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "sri-subramanya-ashtottara": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "sri-subrahmanyeswara": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "subramanya-pooja": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "murugan-pooja": [
    {
      "id": "57",
      "slug": "sri-subrahmanyeswara-pooja",
      "title": "శ్రీ సుబ్రహ్మణ్యేశ్వర పూజ",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "58",
      "slug": "sri-subrahmanya-ashtakam",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టకము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "59",
      "slug": "sri-subrahmanya-pancharatnam",
      "title": "శ్రీ సుబ్రహ్మణ్య పంచరత్నము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "60",
      "slug": "sri-subrahmanya-stotram",
      "title": "శ్రీ సుబ్రహ్మణ్య స్తోత్రము",
      "imageUrl": "/images/deities/card_murugan.jpg"
    }
  ],
  "sri-ayyappa-sharanu-gosha": [
    {
      "id": "40",
      "slug": "ayyappa-sharanu-gosha-108",
      "title": "అయ్యప్ప శరణు ఘోష 108",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "41",
      "slug": "maargamadhya-sharanomulu",
      "title": "మార్గమధ్య శరణములు",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "42",
      "slug": "sahasra-sharanam-1008-aksharamalika",
      "title": "సహస్ర శరణం 1008(అక్షరమాలిక )",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "sri-ayyappa-ashtottara": [
    {
      "id": "61",
      "slug": "sri-ayyappa-pooja",
      "title": "శ్రీ అయ్యప్ప పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "62",
      "slug": "irumudi",
      "title": "ఇరుముడి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "63",
      "slug": "ayyappaswamy-stotram",
      "title": "అయ్యప్పస్వామి స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "64",
      "slug": "sri-sabarigireeshashtakam",
      "title": "శ్రీ శబరిగిరీశాష్టకమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "65",
      "slug": "hariharathmajashtakam",
      "title": "హరిహరాత్మజాష్టకం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "66",
      "slug": "sri-dharmasastha-bhujanga-stotram",
      "title": "శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "67",
      "slug": "sri-dharmasastha-stotram-sringeri",
      "title": "శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "68",
      "slug": "sri-mahashastha-anugraha-kavacham",
      "title": "శ్రీ మహాశాస్తా అనుగ్రహ కవచం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "69",
      "slug": "sri-dharmasastha-sahasranama-stotram",
      "title": "శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "ayyappa-harathi": [
    {
      "id": "90",
      "slug": "harathi-paata-sri-sabarigirivasa",
      "title": "హారతి పాట (శ్రీ శబరిగిరివాస)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "91",
      "slug": "ayyappa-mangala-harathi-shankaraya-shankaraya",
      "title": "అయ్యప్ప మంగళ హారతి(శంకరాయ శంకరాయ)",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "92",
      "slug": "om-mangalam",
      "title": "ఓం మంగళం",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "sri-satyanarayana-swamy-vratham": [
    {
      "id": "29",
      "slug": "satyanarayana-adhyayam-1",
      "title": "||అథ ప్రథమాధ్యాయము||",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "30",
      "slug": "satyanarayana-adhyayam-2",
      "title": "అథ ద్వితీయో ధ్యాయః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "varalakshmi-vratham": [
    {
      "id": "34",
      "slug": "varalakshmi-pooja-vidhanam",
      "title": "వరలక్ష్మీ పూజా విధానం",
      "imageUrl": "/images/deities/card_lakshmi.jpg"
    },
    {
      "id": "35",
      "slug": "varalakshmi-vratha-katha",
      "title": "వరలక్ష్మీ వ్రత కథ",
      "imageUrl": "/images/deities/card_lakshmi.jpg"
    }
  ],
  "vinayaka-vratha-kalpam": [
    {
      "id": "36",
      "slug": "sri-vinayaka-pooja",
      "title": "శ్రీ వినాయక పూజ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "37",
      "slug": "vinayaka-vratha-katha",
      "title": "వినాయక వ్రత కథ",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    }
  ],
  "kedareswara-vratham": [
    {
      "id": "38",
      "slug": "kedareswara-pooja",
      "title": "కేదారేశ్వర పూజ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "39",
      "slug": "sri-kedareswara-vratha-katha",
      "title": "శ్రీ కేదారేశ్వర వ్రత కథ",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    }
  ],
  "ashtottaramulu": [
    {
      "id": "70",
      "slug": "sri-vigneshwara-ashtottara-shatanamavali",
      "title": "శ్రీ విఘ్నేశ్వర అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "71",
      "slug": "sri-subrahmanya-ashtottara-shatanamavali",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "72",
      "slug": "sri-ayyappa-ashtottara-shatanamavali",
      "title": "శ్రీ అయ్యప్ప అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "73",
      "slug": "sri-poorna-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పూర్ణా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "74",
      "slug": "sri-pushkala-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పుష్కలా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "75",
      "slug": "sri-shiva-ashtottara-shatanamavali",
      "title": "శ్రీ శివ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "76",
      "slug": "sri-medha-dakshinamurthy-ashtottara-shatanamavali",
      "title": "శ్రీ మేధా దక్షిణామూర్తి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "77",
      "slug": "sri-veerabhadra-ashtottara-shatanamavali",
      "title": "శ్రీ వీరభద్ర స్తోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "78",
      "slug": "sri-vishvaksena-ashtottara-shatanamavali",
      "title": "శ్రీ విష్వక్సేన అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "79",
      "slug": "sri-mahavishnu-ashtottara-shatanamavali",
      "title": "శ్రీ మహావిష్ణు అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "80",
      "slug": "sri-venkateshwara-ashtottara-shatanamavali",
      "title": "శ్రీ వేంకటేశ్వర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "86",
      "slug": "sri-vasavi-kanyakaparameshwari-ashtottaram",
      "title": "శ్రీ వాసవీ కన్యకాపరమేశ్వరీ అష్టోత్తరము",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "87",
      "slug": "sri-anjaneya-ashtottara-shatanamavali",
      "title": "శ్రీ ఆంజనేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/hanuman.jpg"
    },
    {
      "id": "88",
      "slug": "sri-dattatreya-ashtottara-shatanamavali",
      "title": "శ్రీ దత్తాత్రేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "89",
      "slug": "sri-raghavendra-ashtottara-shatanamavali",
      "title": "శ్రీ రాఘవేంద్ర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    }
  ],
  "ashtothramulu": [
    {
      "id": "70",
      "slug": "sri-vigneshwara-ashtottara-shatanamavali",
      "title": "శ్రీ విఘ్నేశ్వర అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "71",
      "slug": "sri-subrahmanya-ashtottara-shatanamavali",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "72",
      "slug": "sri-ayyappa-ashtottara-shatanamavali",
      "title": "శ్రీ అయ్యప్ప అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "73",
      "slug": "sri-poorna-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పూర్ణా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "74",
      "slug": "sri-pushkala-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పుష్కలా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "75",
      "slug": "sri-shiva-ashtottara-shatanamavali",
      "title": "శ్రీ శివ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "76",
      "slug": "sri-medha-dakshinamurthy-ashtottara-shatanamavali",
      "title": "శ్రీ మేధా దక్షిణామూర్తి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "77",
      "slug": "sri-veerabhadra-ashtottara-shatanamavali",
      "title": "శ్రీ వీరభద్ర స్తోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "78",
      "slug": "sri-vishvaksena-ashtottara-shatanamavali",
      "title": "శ్రీ విష్వక్సేన అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "79",
      "slug": "sri-mahavishnu-ashtottara-shatanamavali",
      "title": "శ్రీ మహావిష్ణు అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "80",
      "slug": "sri-venkateshwara-ashtottara-shatanamavali",
      "title": "శ్రీ వేంకటేశ్వర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "86",
      "slug": "sri-vasavi-kanyakaparameshwari-ashtottaram",
      "title": "శ్రీ వాసవీ కన్యకాపరమేశ్వరీ అష్టోత్తరము",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "87",
      "slug": "sri-anjaneya-ashtottara-shatanamavali",
      "title": "శ్రీ ఆంజనేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/hanuman.jpg"
    },
    {
      "id": "88",
      "slug": "sri-dattatreya-ashtottara-shatanamavali",
      "title": "శ్రీ దత్తాత్రేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "89",
      "slug": "sri-raghavendra-ashtottara-shatanamavali",
      "title": "శ్రీ రాఘవేంద్ర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    }
  ],
  "ashtothram": [
    {
      "id": "70",
      "slug": "sri-vigneshwara-ashtottara-shatanamavali",
      "title": "శ్రీ విఘ్నేశ్వర అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "71",
      "slug": "sri-subrahmanya-ashtottara-shatanamavali",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "72",
      "slug": "sri-ayyappa-ashtottara-shatanamavali",
      "title": "శ్రీ అయ్యప్ప అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "73",
      "slug": "sri-poorna-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పూర్ణా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "74",
      "slug": "sri-pushkala-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పుష్కలా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "75",
      "slug": "sri-shiva-ashtottara-shatanamavali",
      "title": "శ్రీ శివ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "76",
      "slug": "sri-medha-dakshinamurthy-ashtottara-shatanamavali",
      "title": "శ్రీ మేధా దక్షిణామూర్తి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "77",
      "slug": "sri-veerabhadra-ashtottara-shatanamavali",
      "title": "శ్రీ వీరభద్ర స్తోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "78",
      "slug": "sri-vishvaksena-ashtottara-shatanamavali",
      "title": "శ్రీ విష్వక్సేన అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "79",
      "slug": "sri-mahavishnu-ashtottara-shatanamavali",
      "title": "శ్రీ మహావిష్ణు అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "80",
      "slug": "sri-venkateshwara-ashtottara-shatanamavali",
      "title": "శ్రీ వేంకటేశ్వర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "86",
      "slug": "sri-vasavi-kanyakaparameshwari-ashtottaram",
      "title": "శ్రీ వాసవీ కన్యకాపరమేశ్వరీ అష్టోత్తరము",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "87",
      "slug": "sri-anjaneya-ashtottara-shatanamavali",
      "title": "శ్రీ ఆంజనేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/hanuman.jpg"
    },
    {
      "id": "88",
      "slug": "sri-dattatreya-ashtottara-shatanamavali",
      "title": "శ్రీ దత్తాత్రేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "89",
      "slug": "sri-raghavendra-ashtottara-shatanamavali",
      "title": "శ్రీ రాఘవేంద్ర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    }
  ],
  "ashtottara-shatanamavali": [
    {
      "id": "70",
      "slug": "sri-vigneshwara-ashtottara-shatanamavali",
      "title": "శ్రీ విఘ్నేశ్వర అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ganesha.jpg"
    },
    {
      "id": "71",
      "slug": "sri-subrahmanya-ashtottara-shatanamavali",
      "title": "శ్రీ సుబ్రహ్మణ్య అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_murugan.jpg"
    },
    {
      "id": "72",
      "slug": "sri-ayyappa-ashtottara-shatanamavali",
      "title": "శ్రీ అయ్యప్ప అష్టోత్తర శతనామావళి",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "73",
      "slug": "sri-poorna-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పూర్ణా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "74",
      "slug": "sri-pushkala-devi-ashtottara-shatanamavali",
      "title": "శ్రీ పుష్కలా దేవ్యష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_ayyappa.jpg"
    },
    {
      "id": "75",
      "slug": "sri-shiva-ashtottara-shatanamavali",
      "title": "శ్రీ శివ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "76",
      "slug": "sri-medha-dakshinamurthy-ashtottara-shatanamavali",
      "title": "శ్రీ మేధా దక్షిణామూర్తి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "77",
      "slug": "sri-veerabhadra-ashtottara-shatanamavali",
      "title": "శ్రీ వీరభద్ర స్తోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "78",
      "slug": "sri-vishvaksena-ashtottara-shatanamavali",
      "title": "శ్రీ విష్వక్సేన అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "79",
      "slug": "sri-mahavishnu-ashtottara-shatanamavali",
      "title": "శ్రీ మహావిష్ణు అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "80",
      "slug": "sri-venkateshwara-ashtottara-shatanamavali",
      "title": "శ్రీ వేంకటేశ్వర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_vishnu.jpg"
    },
    {
      "id": "81",
      "slug": "sri-gomatha-ashtottara-shatanamavali",
      "title": "శ్రీ గోమాత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/pooja/pooja-card-5-ref.png"
    },
    {
      "id": "82",
      "slug": "sri-lalitha-ashtottara-shatanamavali",
      "title": "శ్రీ లలిత అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "83",
      "slug": "sri-lakshmi-ashtottara-shatanamavali",
      "title": "శ్రీ లక్ష్మి అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "84",
      "slug": "sri-saraswathi-ashtottara-shatanamavali",
      "title": "శ్రీ సరస్వతీ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "85",
      "slug": "sri-durga-ashtottara-shatanamavali",
      "title": "శ్రీ దుర్గ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "86",
      "slug": "sri-vasavi-kanyakaparameshwari-ashtottaram",
      "title": "శ్రీ వాసవీ కన్యకాపరమేశ్వరీ అష్టోత్తరము",
      "imageUrl": "/images/deities/card_devi.jpg"
    },
    {
      "id": "87",
      "slug": "sri-anjaneya-ashtottara-shatanamavali",
      "title": "శ్రీ ఆంజనేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/hanuman.jpg"
    },
    {
      "id": "88",
      "slug": "sri-dattatreya-ashtottara-shatanamavali",
      "title": "శ్రీ దత్తాత్రేయ అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    },
    {
      "id": "89",
      "slug": "sri-raghavendra-ashtottara-shatanamavali",
      "title": "శ్రీ రాఘవేంద్ర అష్టోత్తర శతనామావళిః",
      "imageUrl": "/images/deities/card_shiva.jpg"
    }
  ]
};
