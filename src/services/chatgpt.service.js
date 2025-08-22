require("dotenv").config();
const OpenAI = require('openai'); // <-- CJS için doğru

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tek bir kişiye “günaydın + dinî” mesajı üret
async function generateMorningMessage(name) {
    // Responses API — metin üretimi
    const model = process.env.MODEL || 'gpt-4.1-mini';

    const system = `
Sen Türkçe yazan, saygılı ve kapsayıcı bir yardımcı yazarsın.
Her sabah için kısa (max 2-3 cümle), sıcak, "günaydın" temalı ve dinî bir mesaj oluştur.
Tarz: nezaketli, yargılayıcı olmayan, mezhepsel/siyasi göndermeden kaçınan.
İçerik: sabır, şükür, bereket, hayır dua gibi genel ifadeler; ayet/hadis varsa kaynak belirtmeden kısa ve genelleyici tut.
Emoji olabilir ama en fazla 1 adet.
Sonunda iyi dilek cümlesi ekle (ör. "Hayırlı sabahlar.").
`;
    const user = `
Alıcı adı: ${name}
Dil: Türkçe
Ek kurallar:
- 200 karakteri geçme.
- "spam" hissi vermeyecek doğal bir selamla başla (ör. "Günaydın ${name}!").
- Cinsiyetsiz hitap et.
`;

    const response = await client.responses.create({
        model,
        input: [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ]
    });

    return response.output_text?.trim() || 'Günaydın! Hayırlı sabahlar.';
}


module.exports = { generateMorningMessage };