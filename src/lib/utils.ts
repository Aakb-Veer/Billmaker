// Gujarati number mapping
const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];

// Convert number to Gujarati numerals
export function toGujaratiNumber(num: number | string): string {
    return num.toString().replace(/\d/g, (digit) => gujaratiDigits[parseInt(digit)]);
}

// Convert number to words (English)
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToWords(num: number): string {
    if (num === 0) return 'Zero';

    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

// Gujarati number words
const gujaratiOnes = ['', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ',
    'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ'];
const gujaratiTens = ['', '', 'વીસ', 'ત્રીસ', 'ચાલીસ', 'પચાસ', 'સાઈઠ', 'સિત્તેર', 'એંસી', 'નેવું'];

export function numberToGujaratiWords(num: number): string {
    if (num === 0) return 'શૂન્ય';

    if (num < 20) return gujaratiOnes[num];
    if (num < 100) {
        const unit = num % 10;
        const ten = Math.floor(num / 10);
        if (unit === 0) return gujaratiTens[ten];
        // Special cases for Gujarati (e.g., 21 = એકવીસ, not વીસ એક)
        return gujaratiOnes[unit] + (gujaratiTens[ten] ? gujaratiTens[ten].replace('વીસ', 'વીસ').replace('ત્રીસ', 'ત્રીસ') : '');
    }
    if (num < 1000) return gujaratiOnes[Math.floor(num / 100)] + ' સો' + (num % 100 ? ' ' + numberToGujaratiWords(num % 100) : '');
    if (num < 100000) return numberToGujaratiWords(Math.floor(num / 1000)) + ' હજાર' + (num % 1000 ? ' ' + numberToGujaratiWords(num % 1000) : '');
    if (num < 10000000) return numberToGujaratiWords(Math.floor(num / 100000)) + ' લાખ' + (num % 100000 ? ' ' + numberToGujaratiWords(num % 100000) : '');
    return numberToGujaratiWords(Math.floor(num / 10000000)) + ' કરોડ' + (num % 10000000 ? ' ' + numberToGujaratiWords(num % 10000000) : '');
}

// Format date to DD/MM/YYYY
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format date in Gujarati numerals (DD/MM/YYYY → ડીડી/એમએમ/વાયવાય)
export function formatDateGujarati(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${toGujaratiNumber(day)}/${toGujaratiNumber(month)}/${toGujaratiNumber(year)}`;
}

// Get today's date in YYYY-MM-DD format for input[type="date"]
export function getTodayISO(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Debounce function for search
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Convert payment mode to Gujarati
export function paymentModeToGujarati(mode: string): string {
    const modes: Record<string, string> = {
        'Cash': 'રોકડ',
        'UPI': 'યુપીઆઈ',
        'NEFT': 'એનઈએફટી',
        'Cheque': 'ચેક',
        'Bank Transfer': 'બેંક ટ્રાન્સફર',
    };
    return modes[mode] || mode;
}

// English to Gujarati Transliteration
export function transliterateToGujarati(text: string): string {
    // If already contains Gujarati characters, return as-is
    if (/[\u0A80-\u0AFF]/.test(text)) {
        return text;
    }

    // Mapping of English sounds to Gujarati
    const map: [RegExp, string][] = [
        // Vowels at start or after vowel
        [/\b[Aa]/g, 'અ'], [/\b[Aa]a/g, 'આ'], [/\b[Ii]/g, 'ઇ'], [/\b[Ee]e/g, 'ઈ'],
        [/\b[Uu]/g, 'ઉ'], [/\b[Oo]o/g, 'ઊ'], [/\b[Ee]/g, 'એ'], [/\b[Aa]i/g, 'ઐ'],
        [/\b[Oo]/g, 'ઓ'], [/\b[Aa]u/g, 'ઔ'],

        // Special consonant combinations first
        [/[Kk]h/g, 'ખ'], [/[Gg]h/g, 'ઘ'], [/[Cc]h/g, 'છ'], [/[Jj]h/g, 'ઝ'],
        [/[Tt]h/g, 'થ'], [/[Dd]h/g, 'ધ'], [/[Pp]h/g, 'ફ'], [/[Bb]h/g, 'ભ'],
        [/[Ss]h/g, 'શ'],

        // Consonants
        [/[Kk]/g, 'ક'], [/[Gg]/g, 'ગ'], [/[Cc]/g, 'ચ'], [/[Jj]/g, 'જ'],
        [/[Tt]/g, 'ત'], [/[Dd]/g, 'ડ'], [/[Nn]/g, 'ન'], [/[Pp]/g, 'પ'],
        [/[Bb]/g, 'બ'], [/[Mm]/g, 'મ'], [/[Yy]/g, 'ય'], [/[Rr]/g, 'ર'],
        [/[Ll]/g, 'લ'], [/[Vv]/g, 'વ'], [/[Ww]/g, 'વ'], [/[Ss]/g, 'સ'],
        [/[Hh]/g, 'હ'],

        // Vowel matras (after consonants)
        [/a(?![aeiou])/g, ''], // 'a' is inherent, remove it
        [/aa/g, 'ા'], [/i(?![aeiou])/g, 'િ'], [/ee|ii/g, 'ી'],
        [/u(?![aeiou])/g, 'ુ'], [/oo|uu/g, 'ૂ'], [/e(?![aeiou])/g, 'ે'],
        [/ai/g, 'ૈ'], [/o(?![aeiou])/g, 'ો'], [/au|ou/g, 'ૌ'],
    ];

    let result = text.toLowerCase();
    for (const [pattern, replacement] of map) {
        result = result.replace(pattern, replacement);
    }

    return result;
}

// Common name transliterations (for better accuracy)
const commonNames: Record<string, string> = {
    'veer': 'વીર',
    'ram': 'રામ',
    'shyam': 'શ્યામ',
    'krishna': 'કૃષ્ણ',
    'patel': 'પટેલ',
    'shah': 'શાહ',
    'mehta': 'મહેતા',
    'joshi': 'જોશી',
    'desai': 'દેસાઈ',
    'bhatt': 'ભટ્ટ',
    'sharma': 'શર્મા',
    'dave': 'દવે',
    'parikh': 'પરીખ',
    'modi': 'મોદી',
    'gandhi': 'ગાંધી',
    'pandya': 'પંડ્યા',
    'trivedi': 'ત્રિવેદી',
    'raval': 'રાવલ',
    'soni': 'સોની',
    'chauhan': 'ચૌહાણ',
    'rajput': 'રાજપૂત',
    'thakkar': 'ઠક્કર',
    'vyas': 'વ્યાસ',
    'jadeja': 'જાડેજા',
    'gohil': 'ગોહિલ',
    'solanki': 'સોલંકી',
    'vaghela': 'વાઘેલા',
    'thakor': 'ઠાકોર',
    'amin': 'અમીન',
    'barot': 'બારોટ',
    'choksi': 'ચોક્સી',
    'contractor': 'કોન્ટ્રાક્ટર',
    'engineer': 'એન્જિનિયર',
    'shri': 'શ્રી',
    'shrimati': 'શ્રીમતી',
    'bhai': 'ભાઈ',
    'ben': 'બેન',
    'kumar': 'કુમાર',
    'bhanushali': 'ભાનુશાલી',
};

export function smartTransliterate(name: string): string {
    // If already Gujarati, return as-is
    if (/[\u0A80-\u0AFF]/.test(name)) {
        return name;
    }

    // Try to match common names first
    const words = name.toLowerCase().trim().split(/\s+/);
    const transliterated = words.map(word => {
        if (commonNames[word]) {
            return commonNames[word];
        }
        return transliterateToGujarati(word);
    });

    return transliterated.join(' ');
}
