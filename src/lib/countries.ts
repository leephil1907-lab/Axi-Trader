"use client";

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "ko", label: "한국어" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "th", label: "ไทย" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "hi", label: "हिन्दी" },
];

export const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", label: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", label: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "ZAR", label: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "MXN", label: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "RUB", label: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
  { code: "KRW", label: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
];

export const ACCOUNT_TYPES = [
  { id: "standard", label: "Standard", minDeposit: 0, spread: "0.4 pips", commission: "Zero", leverage: "500:1", description: "Best for beginners" },
  { id: "pro", label: "Pro", minDeposit: 1000, spread: "0.0 pips", commission: "$7 round turn", leverage: "500:1", description: "Best for active traders" },
  { id: "elite", label: "Elite", minDeposit: 25000, spread: "0.0 pips", commission: "$3.5 round turn", leverage: "500:1", description: "Best for high-volume traders" },
];

export const PLATFORMS = [
  { id: "mt5", label: "MetaTrader 5", description: "Next-gen platform with advanced features", icon: "Monitor" },
  { id: "mt4", label: "MetaTrader 4", description: "Industry standard, proven reliability", icon: "Monitor" },
  { id: "axi", label: "Axi Trading Platform", description: "Our proprietary web & mobile platform", icon: "Smartphone" },
];
