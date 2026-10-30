export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  disclaimerShort: string;
  disclaimerFull: string;
  disclaimerEmergency: string;
  startBtn: string;
  privacyBadge: string;
  backBtn: string;
  nextBtn: string;
  submitBtn: string;
  refineBtn: string;
  startOverBtn: string;
  downloadBtn: string;
  emergencyTitle: string;
  emergencyCall: string;
  emergencyAdvice: string;
  questionnaireTitle: string;
  stepOf: string;
  categories: {
    demographics: string;
    habits: string;
    health: string;
    vitals: string;
  };
  questions: {
    redFlag: {
      title: string;
      subtitle: string;
      yes: string;
      no: string;
    };
    age: {
      title: string;
      subtitle: string;
    };
    sex: {
      title: string;
      subtitle: string;
      male: string;
      female: string;
    };
    state: {
      title: string;
      subtitle: string;
    };
    urbanRural: {
      title: string;
      subtitle: string;
      urban: string;
      rural: string;
    };
    heightWeight: {
      title: string;
      subtitle: string;
      height: string;
      weight: string;
      computedBmi: string;
    };
    smoking: {
      title: string;
      subtitle: string;
      never: string;
      former: string;
      current: string;
    };
    smokeless: {
      title: string;
      subtitle: string;
      no: string;
      yes: string;
    };
    alcohol: {
      title: string;
      subtitle: string;
      never: string;
      moderate: string;
      heavy: string;
    };
    activity: {
      title: string;
      subtitle: string;
      mins: string;
    };
    diet: {
      title: string;
      subtitle: string;
      poor: string;
      average: string;
      healthy: string;
    };
    stress: {
      title: string;
      subtitle: string;
      low: string;
      moderate: string;
      high: string;
    };
    sleep: {
      title: string;
      subtitle: string;
      hours: string;
    };
    familyHistory: {
      title: string;
      subtitle: string;
      no: string;
      yes: string;
    };
    diabetes: {
      title: string;
      subtitle: string;
      no: string;
      yes: string;
    };
    hypertension: {
      title: string;
      subtitle: string;
      no: string;
      yes: string;
    };
  };
  results: {
    title: string;
    estimatedRisk: string;
    riskBand: string;
    bands: {
      low: string;
      moderate: string;
      high: string;
    };
    bandDescriptions: {
      low: string;
      moderate: string;
      high: string;
    };
    topFactorsTitle: string;
    topFactorsSubtitle: string;
    raisesRisk: string;
    lowersRisk: string;
    assumedTitle: string;
    assumedSubtitle: string;
    recommendationsTitle: string;
    stateComparisonTitle: string;
    nationalAvg: string;
    stateAvg: string;
    consultDoctor: string;
  };
  vitalsModal: {
    title: string;
    subtitle: string;
    sbp: string;
    dbp: string;
    hr: string;
    spo2: string;
    ecg: string;
    ldl: string;
    hba1c: string;
    ecgOptions: {
      normal: string;
      st_t_changes: string;
      arrhythmia: string;
      lvh: string;
      q_waves: string;
    };
    calculateRefined: string;
    cancel: string;
    beforeAfter: string;
    lifestyleRisk: string;
    vitalsRisk: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "HeartWise India",
    tagline: "Personalized cardiovascular risk screening & awareness for Indian adults.",
    disclaimerShort: "Awareness tool, not a medical diagnosis.",
    disclaimerFull: "HeartWise India provides an estimated chance of cardiovascular disease based on population-calibrated statistical models. It does not replace a clinical examination by a physician.",
    disclaimerEmergency: "If you are experiencing severe symptoms right now, do not wait.",
    startBtn: "Take assessment",
    privacyBadge: "100% Private: No personal data is stored or logged.",
    backBtn: "Back",
    nextBtn: "Continue",
    submitBtn: "Calculate My Risk",
    refineBtn: "Refine with Vitals & ECG",
    startOverBtn: "Check Another Profile",
    downloadBtn: "Save / Print Report",
    emergencyTitle: "Seek Emergency Medical Care Immediately",
    emergencyCall: "Call 112 (National Emergency, India)",
    emergencyAdvice: "You reported urgent symptoms (chest pain, shortness of breath at rest, or fainting). Please seek prompt emergency evaluation at the nearest hospital.",
    questionnaireTitle: "Lifestyle & Health Assessment",
    stepOf: "Step {current} of {total}",
    categories: {
      demographics: "About You",
      habits: "Habits & Daily Life",
      health: "Health History",
      vitals: "Clinical Vitals & ECG",
    },
    questions: {
      redFlag: {
        title: "Safety Check: Are you experiencing any of these right now?",
        subtitle: "Severe chest pressure or pain, shortness of breath while resting, sudden dizziness, or loss of consciousness.",
        yes: "Yes, I am feeling this right now",
        no: "No, I feel stable right now",
      },
      age: {
        title: "What is your current age?",
        subtitle: "Age is a fundamental determinant of cardiovascular vascular age.",
      },
      sex: {
        title: "What was your biological sex assigned at birth?",
        subtitle: "Cardiovascular risk profiles differ between males and females.",
        male: "Male",
        female: "Female",
      },
      state: {
        title: "Which Indian state or union territory do you live in?",
        subtitle: "Heart disease prevalence varies by region according to ICMR epidemiological surveys.",
      },
      urbanRural: {
        title: "Do you reside in an urban or rural setting?",
        subtitle: "Urban lifestyles often correlate with dietary and physical activity patterns.",
        urban: "Urban (City / Metro)",
        rural: "Rural (Town / Village)",
      },
      heightWeight: {
        title: "What are your height and weight?",
        subtitle: "We use this to calculate your Body Mass Index (BMI).",
        height: "Height (cm)",
        weight: "Weight (kg)",
        computedBmi: "Your Body Mass Index (BMI)",
      },
      smoking: {
        title: "Do you smoke cigarettes or bidis?",
        subtitle: "Inhaled tobacco accelerates atherosclerosis and arterial inflammation.",
        never: "Never smoked",
        former: "Former smoker (Quit)",
        current: "Current smoker",
      },
      smokeless: {
        title: "Do you consume smokeless tobacco?",
        subtitle: "E.g., Gutkha, Khaini, Zarda, Paan Masala with tobacco.",
        no: "No, never consume",
        yes: "Yes, consume regularly",
      },
      alcohol: {
        title: "What is your typical alcohol consumption?",
        subtitle: "Heavy consumption increases blood pressure and cardiomyopathy risk.",
        never: "Never / Rarely",
        moderate: "Moderate (Occasional social)",
        heavy: "Heavy / Frequent",
      },
      activity: {
        title: "Weekly physical activity minutes",
        subtitle: "Moderate-to-vigorous exercise (brisk walking, cycling, sports, yoga). WHO recommends >= 150 mins.",
        mins: "Minutes per week",
      },
      diet: {
        title: "How would you describe your typical diet?",
        subtitle: "Nutrition directly affects cholesterol and vascular health.",
        poor: "High Fried & Sugary (frequent street food, sweets, refined flours)",
        average: "Average Home Diet (balanced Indian meals with occasional fried foods)",
        healthy: "Heart-Protective (rich in vegetables, salads, millets, whole grains, nuts)",
      },
      stress: {
        title: "What is your daily stress level?",
        subtitle: "Chronic mental and work stress elevates sympathetic arterial tone.",
        low: "Low (Generally calm & relaxed)",
        moderate: "Moderate (Occasional everyday stress)",
        high: "High (Frequent intense tension)",
      },
      sleep: {
        title: "Average nightly sleep duration",
        subtitle: "Optimal restorative cardiovascular sleep is typically 7-8 hours.",
        hours: "Hours of sleep per night",
      },
      familyHistory: {
        title: "Family history of early heart disease?",
        subtitle: "A parent or sibling who suffered a heart attack or angina before age 60.",
        no: "No known early family history",
        yes: "Yes, direct family history",
      },
      diabetes: {
        title: "Have you been diagnosed with Diabetes?",
        subtitle: "High blood glucose accelerates coronary artery endothelial damage.",
        no: "No diabetes",
        yes: "Yes, diagnosed with diabetes",
      },
      hypertension: {
        title: "Have you been diagnosed with High Blood Pressure?",
        subtitle: "Hypertension is the leading modifiable cardiac risk factor in India.",
        no: "No hypertension",
        yes: "Yes, high blood pressure",
      },
    },
    results: {
      title: "Estimated Cardiovascular Risk Screening",
      estimatedRisk: "Estimated 10-Year Cardiac Disease Chance",
      riskBand: "Risk Category",
      bands: {
        low: "Low Risk (< 5%)",
        moderate: "Moderate Risk (5% - 15%)",
        high: "Elevated Risk (> 15%)",
      },
      bandDescriptions: {
        low: "Your estimated chance is below 5%. Maintaining your healthy lifestyle habits keeps your risk low.",
        moderate: "Your estimated chance is between 5% and 15%. Targeted lifestyle modifications can substantially lower this risk.",
        high: "Your estimated chance is above 15%. A clinical consultation with a physician or cardiologist is strongly advised.",
      },
      topFactorsTitle: "Top Factors Influencing Your Estimate",
      topFactorsSubtitle: "Relative size and direction of primary contributors according to model coefficients.",
      raisesRisk: "Raises Risk",
      lowersRisk: "Lowers Risk",
      assumedTitle: "Assumed Baseline Inputs",
      assumedSubtitle: "Because some optional metrics were omitted, we used Indian population medians:",
      recommendationsTitle: "Personalized Action Steps",
      stateComparisonTitle: "Regional Perspective (Your State vs India)",
      nationalAvg: "National Average",
      stateAvg: "State Average",
      consultDoctor: "Please consult a qualified doctor or cardiologist for diagnostic testing and personalized medical advice.",
    },
    vitalsModal: {
      title: "Refine Estimate with Clinical Vitals & ECG",
      subtitle: "Add your blood pressure, heart rate, or ECG details for an enhanced Model B assessment.",
      sbp: "Systolic BP (mmHg, e.g. 120)",
      dbp: "Diastolic BP (mmHg, e.g. 80)",
      hr: "Resting Heart Rate (bpm)",
      spo2: "SpO2 Oxygen Saturation (%)",
      ecg: "ECG Finding (if available)",
      ldl: "LDL Cholesterol (mg/dL, optional)",
      hba1c: "HbA1c Blood Sugar (%, optional)",
      ecgOptions: {
        normal: "Normal ECG (no major abnormalities)",
        st_t_changes: "ST-T Wave Changes (possible ischemia)",
        arrhythmia: "Arrhythmia (irregular rhythm / AFib)",
        lvh: "Left Ventricular Hypertrophy (LVH)",
        q_waves: "Pathological Q-Waves (past infarct)",
      },
      calculateRefined: "Update Assessment with Vitals",
      cancel: "Cancel",
      beforeAfter: "Risk Comparison (Lifestyle vs Vitals+ECG)",
      lifestyleRisk: "Lifestyle Only (Model A)",
      vitalsRisk: "Refined with Vitals (Model B)",
    },
  },
  hi: {
    appName: "HeartWise India (हार्टवाइज़ इंडिया)",
    tagline: "भारतीय वयस्कों के लिए हृदय स्वास्थ्य जोखिम जागरूकता और स्क्रीनिंग।",
    disclaimerShort: "जागरूकता उपकरण, चिकित्सीय निदान नहीं।",
    disclaimerFull: "हार्टवाइज़ इंडिया सांख्यिकीय मॉडलों के आधार पर हृदय रोग की अनुमानित संभावना प्रदान करता है। यह डॉक्टर द्वारा की जाने वाली नैदानिक जांच का विकल्प नहीं है।",
    disclaimerEmergency: "यदि आप अभी गंभीर लक्षणों का अनुभव कर रहे हैं, तो तुरंत सहायता लें।",
    startBtn: "जोखिम स्क्रीनिंग शुरू करें",
    privacyBadge: "100% गोपनीय: कोई भी व्यक्तिगत डेटा सहेजा नहीं जाता है।",
    backBtn: "पीछे",
    nextBtn: "आगे बढ़ें",
    submitBtn: "मेरे जोखिम का अनुमान लगाएं",
    refineBtn: "वाइटल्स और ईसीजी से और सटीक बनाएं",
    startOverBtn: "नई स्क्रीनिंग करें",
    downloadBtn: "रिपोर्ट सहेजें / प्रिंट करें",
    emergencyTitle: "तुरंत आपातकालीन चिकित्सा सहायता लें",
    emergencyCall: "112 पर कॉल करें (राष्ट्रीय आपातकाल, भारत)",
    emergencyAdvice: "आपने आपातकालीन लक्षणों (सीने में दर्द, सांस लेने में तकलीफ या बेहोशी) की सूचना दी है। कृपया तुरंत निकटतम अस्पताल जाएं।",
    questionnaireTitle: "जीवनशैली और स्वास्थ्य मूल्यांकन",
    stepOf: "चरण {current} / {total}",
    categories: {
      demographics: "आपके बारे में",
      habits: "आदतें और दिनचर्या",
      health: "स्वास्थ्य इतिहास",
      vitals: "वाइटल्स और ईसीजी",
    },
    questions: {
      redFlag: {
        title: "सुरक्षा जांच: क्या आप अभी इनमें से किसी का अनुभव कर रहे हैं?",
        subtitle: "सीने में तेज दर्द या भारीपन, आराम करते समय सांस फूलना, अचानक चक्कर आना या बेहोशी।",
        yes: "हाँ, मैं अभी यह महसूस कर रहा हूँ",
        no: "नहीं, मैं अभी बिल्कुल ठीक हूँ",
      },
      age: {
        title: "आपकी वर्तमान आयु क्या है?",
        subtitle: "आयु हृदय संबंधी स्वास्थ्य और जोखिम का एक मुख्य कारक है।",
      },
      sex: {
        title: "आपका जैविक लिंग क्या है?",
        subtitle: "हृदय जोखिम प्रोफाइल पुरुषों और महिलाओं में भिन्न हो सकते हैं।",
        male: "पुरुष",
        female: "महिला",
      },
      state: {
        title: "आप किस भारतीय राज्य में रहते हैं?",
        subtitle: "आईसीएमआर के अनुसार विभिन्न क्षेत्रों में हृदय रोग का प्रसार भिन्न है।",
      },
      urbanRural: {
        title: "क्या आप शहरी या ग्रामीण क्षेत्र में रहते हैं?",
        subtitle: "शहरी और ग्रामीण क्षेत्रों में खानपान व दिनचर्या में अंतर होता है।",
        urban: "शहरी (शहर / मेट्रो)",
        rural: "ग्रामीण (कस्बा / गाँव)",
      },
      heightWeight: {
        title: "आपकी लंबाई और वजन क्या है?",
        subtitle: "हम इसका उपयोग आपके बॉडी मास इंडेक्स (BMI) की गणना के लिए करते हैं।",
        height: "लंबाई (सेमी)",
        weight: "वजन (किलोग्राम)",
        computedBmi: "आपका बॉडी मास इंडेक्स (BMI)",
      },
      smoking: {
        title: "क्या आप बीड़ी या सिगरेट पीते हैं?",
        subtitle: "धूम्रपान से रक्त धमनियों में रुकावट और सूजन का खतरा बढ़ता है।",
        never: "कभी नहीं पी",
        former: "पहले पीते थे (अब छोड़ दी)",
        current: "वर्तमान में पीते हैं",
      },
      smokeless: {
        title: "क्या आप तंबाकू या गुटखा का सेवन करते हैं?",
        subtitle: "जैसे कि गुटखा, खैनी, जर्दा या तंबाकू युक्त पान मसाला।",
        no: "नहीं, कभी नहीं",
        yes: "हाँ, नियमित सेवन करते हैं",
      },
      alcohol: {
        title: "शराब (अल्कोहल) का सेवन कितना करते हैं?",
        subtitle: "अधिक शराब पीने से रक्तचाप बढ़ता है और हृदय की मांसपेशियां कमजोर होती हैं।",
        never: "बिल्कुल नहीं / कभी-कभार",
        moderate: "मध्यम (सामाजिक मौकों पर)",
        heavy: "अधिक / नियमित",
      },
      activity: {
        title: "साप्ताहिक शारीरिक गतिविधि (मिनट)",
        subtitle: "तेज चलना, साइकिल चलाना, योग या व्यायाम। डब्ल्यूएचओ प्रति सप्ताह 150+ मिनट की सिफारिश करता है।",
        mins: "मिनट प्रति सप्ताह",
      },
      diet: {
        title: "आपका सामान्य आहार कैसा है?",
        subtitle: "पोषण सीधे कोलेस्ट्रॉल और हृदय धमनियों को प्रभावित करता है।",
        poor: "तला-भुना व मीठा (फास्ट फूड, मिठाई, अधिक तेल)",
        average: "सामान्य घरेलू भोजन (संतुलित भारतीय भोजन)",
        healthy: "हृदय-सुरक्षित (हरी सब्जियां, सलाद, मिलेट्स/मोटा अनाज, फल)",
      },
      stress: {
        title: "आपका दैनिक तनाव स्तर कैसा रहता है?",
        subtitle: "लगातार अत्यधिक मानसिक तनाव रक्तचाप और हृदय की धड़कन को प्रभावित करता है।",
        low: "कम (सामान्यतः शांत और तनावमुक्त)",
        moderate: "मध्यम (सामान्य रोज़मर्रा का तनाव)",
        high: "उच्च (अक्सर तीव्र तनाव या चिंता)",
      },
      sleep: {
        title: "रात में औसत नींद की अवधि",
        subtitle: "हृदय के स्वस्थ पुनर्जनन के लिए 7-8 घंटे की गहरी नींद आवश्यक है।",
        hours: "घंटे प्रति रात",
      },
      familyHistory: {
        title: "क्या परिवार में समय से पहले हृदय रोग का इतिहास है?",
        subtitle: "माता-पिता या भाई-बहन को 60 वर्ष की आयु से पहले दिल का दौरा पड़ा हो।",
        no: "कोई ज्ञात पारिवारिक इतिहास नहीं",
        yes: "हाँ, प्रत्यक्ष पारिवारिक इतिहास है",
      },
      diabetes: {
        title: "क्या आपको मधुमेह (डायबिटीज) है?",
        subtitle: "रक्त में शर्करा का उच्च स्तर हृदय की रक्त वाहिकाओं को नुकसान पहुंचाता है।",
        no: "डायबिटीज नहीं है",
        yes: "हाँ, डायबिटीज से पीड़ित हैं",
      },
      hypertension: {
        title: "क्या आपको उच्च रक्तचाप (हाई बीपी) है?",
        subtitle: "भारत में उच्च रक्तचाप हृदय रोग का प्रमुख कारण है।",
        no: "हाई बीपी नहीं है",
        yes: "हाँ, हाई बीपी की समस्या है",
      },
    },
    results: {
      title: "अनुमानित हृदय रोग जोखिम स्क्रीनिंग",
      estimatedRisk: "10-वर्षीय हृदय रोग की अनुमानित संभावना",
      riskBand: "जोखिम श्रेणी",
      bands: {
        low: "कम जोखिम (< 5%)",
        moderate: "मध्यम जोखिम (5% - 15%)",
        high: "बढ़ा हुआ जोखिम (> 15%)",
      },
      bandDescriptions: {
        low: "आपकी अनुमानित संभावना 5% से कम है। स्वस्थ जीवनशैली बनाए रखकर आप हृदय को सुरक्षित रख सकते हैं।",
        moderate: "आपकी अनुमानित संभावना 5% से 15% के बीच है। जीवनशैली में सुधार करके इसे कम किया जा सकता है।",
        high: "आपकी अनुमानित संभावना 15% से अधिक है। किसी योग्य डॉक्टर या हृदय रोग विशेषज्ञ से जांच की सलाह दी जाती है।",
      },
      topFactorsTitle: "आपके अनुमान को प्रभावित करने वाले मुख्य कारक",
      topFactorsSubtitle: "मॉडल के अनुसार जोखिम को बढ़ाने या घटाने वाले प्रमुख घटक:",
      raisesRisk: "जोखिम बढ़ाता है",
      lowersRisk: "जोखिम घटाता है",
      assumedTitle: "अनुमानित इनपुट (डिफ़ॉल्ट)",
      assumedSubtitle: "क्योंकि कुछ वैकल्पिक विवरण नहीं दिए गए थे, हमने भारतीय जनसंख्या के औसत का उपयोग किया:",
      recommendationsTitle: "आपके लिए महत्वपूर्ण स्वास्थ्य सुझाव",
      stateComparisonTitle: "क्षेत्रीय तुलना (आपका राज्य बनाम भारत)",
      nationalAvg: "राष्ट्रीय औसत",
      stateAvg: "राज्य का औसत",
      consultDoctor: "कृपया नैदानिक परीक्षण और व्यक्तिगत चिकित्सीय सलाह के लिए किसी योग्य डॉक्टर से परामर्श लें।",
    },
    vitalsModal: {
      title: "वाइटल्स और ईसीजी से और सटीक बनाएं",
      subtitle: "अधिक सटीक मॉडल B मूल्यांकन के लिए अपना बीपी, पल्स या ईसीजी विवरण दर्ज करें।",
      sbp: "सिस्टोलिक बीपी (ऊपर वाला, जैसे 120)",
      dbp: "डायस्टोलिक बीपी (नीचे वाला, जैसे 80)",
      hr: "आराम की स्थिति में पल्स (bpm)",
      spo2: "रक्त ऑक्सीजन संतृप्ति SpO2 (%)",
      ecg: "ईसीजी निष्कर्ष (यदि उपलब्ध हो)",
      ldl: "एलडीएल कोलेस्ट्रॉल (mg/dL, वैकल्पिक)",
      hba1c: "एचबीए1सी ब्लड शुगर (%, वैकल्पिक)",
      ecgOptions: {
        normal: "सामान्य ईसीजी (Normal)",
        st_t_changes: "एसटी-टी तरंग परिवर्तन (ST-T changes)",
        arrhythmia: "अतालता / अतालता (Arrhythmia)",
        lvh: "लेफ्ट वेंट्रिकुलर हाइपरट्रॉफी (LVH)",
        q_waves: "पैथोलॉजिकल क्यू-वेव्स (Q-Waves)",
      },
      calculateRefined: "नया अनुमान अपडेट करें",
      cancel: "रद्द करें",
      beforeAfter: "जोखिम तुलना (जीवनशैली बनाम वाइटल्स)",
      lifestyleRisk: "केवल जीवनशैली (Model A)",
      vitalsRisk: "वाइटल्स सहित (Model B)",
    },
  },
};
