const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const Job = require('../src/models/Job');

dotenv.config({ path: path.join(__dirname, '../.env') });

const jobsData = [
  {
    title: 'Senior Frontend Developer (React/Next.js)',
    description: 'Chúng tôi đang tìm kiếm một Senior Frontend Developer tài năng để dẫn dắt đội ngũ phát triển giao diện người dùng cho các ứng dụng web quy mô lớn. Bạn sẽ chịu trách nhiệm tối ưu hóa hiệu suất ứng dụng, xây dựng các component có thể tái sử dụng và đảm bảo trải nghiệm người dùng tốt nhất.',
    requirements: '- Ít nhất 4 năm kinh nghiệm làm việc với React.js.\n- Thành thạo Next.js, TypeScript và Tailwind CSS.\n- Hiểu biết sâu về State Management (Redux, Zustand or TanStack Query).\n- Kinh nghiệm về Unit Test (Jest/React Testing Library).',
    benefits: '- Mức lương cạnh tranh: 30 - 50 triệu VNĐ.\n- Thưởng tháng 13 và thưởng hiệu suất cuối năm.\n- Bảo hiểm sức khỏe cao cấp.\n- Môi trường làm việc linh hoạt, có thể làm remote.',
    salary: { min: 30000000, max: 50000000 },
    location: 'Hồ Chí Minh',
    jobType: 'full-time',
    experience: 'senior',
    category: 'Công nghệ thông tin',
    skills: ['React', 'Next.js', 'Tailwind', 'TypeScript'],
  },
  {
    title: 'Digital Marketing Specialist',
    description: 'Tham gia vào đội ngũ Marketing để triển khai các chiến dịch quảng cáo trên Google Ads, Facebook Ads và quản lý nội dung trên các nền tảng mạng xã hội. Phân tích dữ liệu và tối ưu hóa chuyển đổi cho sản phẩm công ty.',
    requirements: '- 2 năm kinh nghiệm trong lĩnh vực Digital Marketing.\n- Am hiểu về SEO, SEM và Social Media Marketing.\n- Có khả năng phân tích dữ liệu qua Google Analytics.\n- Sáng tạo, có tư duy về Content Marketing.',
    benefits: '- Lương cơ bản + thưởng KPI hấp dẫn.\n- Tham gia các khóa đào tạo chuyên sâu về Marketing.\n- Du lịch công ty hàng năm.\n- Nghỉ phép 15 ngày/năm.',
    salary: { min: 15000000, max: 25000000 },
    location: 'Hà Nội',
    jobType: 'full-time',
    experience: 'junior',
    category: 'Truyền thông / Marketing',
    skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Content'],
  },
  {
    title: 'Node.js Backend Engineer',
    description: 'Phát triển các hệ thống API mạnh mẽ, có khả năng mở rộng cao bằng Node.js và NestJS. Thiết kế cấu trúc database, tối ưu hóa câu lệnh truy vấn và làm việc với các hệ thống caching như Redis.',
    requirements: '- Kinh nghiệm vững chắc với Node.js và Express/NestJS.\n- Thành thạo MongoDB hoặc các hệ điều hành SQL.\n- Hiểu về Microservices và Message Queue (RabbitMQ, Kafka).\n- Tư duy giải thuật và cấu trúc dữ liệu tốt.',
    benefits: '- Gói thu nhập lên đến 40 triệu VNĐ.\n- Review lương 2 lần/năm.\n- Cơm trưa miễn phí tại văn phòng.\n- Hỗ trợ thiết bị làm việc hiện đại (Macbook).',
    salary: { min: 25000000, max: 40000000 },
    location: 'Đà Nẵng',
    jobType: 'full-time',
    experience: 'junior',
    category: 'Công nghệ thông tin',
    skills: ['Node.js', 'NestJS', 'MongoDB', 'Redis'],
  },
  {
    title: 'UI/UX Designer',
    description: 'Thiết kế giao diện và trải nghiệm người dùng cho ứng dụng di động và web. Nghiên cứu hành vi người dùng, vẽ wireframe, prototype và bàn giao thiết kế cho đội ngũ phát triển.',
    requirements: '- Sử dụng thành thạo Figma, Adobe XD.\n- Có kiến thức tốt về Design Systems.\n- Khả năng tư duy logic và thẩm mỹ hiện đại.\n- Portfolio thể hiện được các dự án thực tế.',
    benefits: '- Môi trường sáng tạo, không gò bó.\n- Laptop đời mới phục vụ công việc.\n- Tham dự các hội thảo công nghệ và thiết kế miễn phí.',
    salary: { min: 18000000, max: 30000000 },
    location: 'Hồ Chí Minh',
    jobType: 'full-time',
    experience: 'junior',
    category: 'Thiết kế / Sáng tạo',
    skills: ['Figma', 'UI/UX', 'Prototyping'],
  },
  {
    title: 'Sales Business Development',
    description: 'Tìm kiếm khách hàng tiềm năng, giới thiệu sản phẩm và dịch vụ của công ty đến các đối tác doanh nghiệp. Đàm phán ký kết hợp đồng và duy trì mối quan hệ lâu dài với khách hàng.',
    requirements: '- Kỹ năng giao tiếp và thuyết phục xuất sắc.\n- Có kinh nghiệm làm Sales B2B là một lợi thế.\n- Chịu được áp lực doanh số.\n- Tiếng Anh giao tiếp tốt.',
    benefits: '- Hoa hồng không giới hạn.\n- Phụ cấp xăng xe, điện thoại.\n- Cơ hội thăng tiến lên Manager sau 1 năm.',
    salary: { min: 10000000, max: 20000000 },
    location: 'Hà Nội',
    jobType: 'full-time',
    experience: 'fresher',
    category: 'Kinh doanh',
    skills: ['Communication', 'Sales B2B', 'Negotiation'],
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const employers = await User.find({ role: 'employer' });
    console.log(`Found ${employers.length} employers`);

    if (employers.length === 0) {
      console.log('No employers found. Please create an employer first.');
      process.exit(1);
    }

    for (const employer of employers) {
      console.log(`Seeding jobs for: ${employer.companyName || employer.name}`);
      
      // Seed 2-4 jobs per employer from the template list
      const numJobs = Math.floor(Math.random() * 3) + 2; 
      const shuffled = jobsData.sort(() => 0.5 - Math.random());
      const selectedJobs = shuffled.slice(0, numJobs);

      for (const jobStub of selectedJobs) {
        // Randomize the deadline to be in 1-3 months
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + Math.floor(Math.random() * 3) + 1);

        await Job.create({
          ...jobStub,
          employerId: employer._id,
          deadline: deadline,
          status: 'open',
        });
        console.log(`  - Created job: ${jobStub.title}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
