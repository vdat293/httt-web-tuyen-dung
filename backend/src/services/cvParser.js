const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseCVWithLLM = async (cvText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Bạn là một parser CV. Trích xuất thông tin từ CV và trả về JSON theo đúng format bên dưới, không thêm text nào khác.

Format JSON bắt buộc:
{
  "skills": ["skill1", "skill2", ...],
  "experience": "Tóm tắt kinh nghiệm làm việc",
  "education": "Tóm tắt học vấn"
}

Nếu không có thông tin, dùng mảng rỗng hoặc chuỗi rỗng.

CV:
${cvText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      skills: parsed.skills || [],
      experience: parsed.experience || '',
      education: parsed.education || '',
    };
  } catch (error) {
    console.error('CV Parsing Error:', error.message);
    return {
      skills: [],
      experience: '',
      education: '',
    };
  }
};

module.exports = { parseCVWithLLM };
