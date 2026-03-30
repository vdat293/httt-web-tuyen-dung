require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // 1. Create Users (3 Employers, 2 Candidates)
    const employerKidsPlaza = await User.create({
      email: 'kidsplaza@example.com',
      password: 'password123',
      role: 'employer',
      name: 'Công ty CP Kids Plaza',
      phone: '0912345678',
    });

    const employerFiny = await User.create({
      email: 'finy@example.com',
      password: 'password123',
      role: 'employer',
      name: 'Công ty Cổ phần Finy',
      phone: '0988888888',
    });

    const employerQG = await User.create({
      email: 'qgvn@example.com',
      password: 'password123',
      role: 'employer',
      name: 'CÔNG TY CP ỨNG DỤNG DỮ LIỆU QG VN',
      phone: '0999999999',
    });

    const employerVNG = await User.create({
      email: 'vng@example.com',
      password: 'password123',
      role: 'employer',
      name: 'Công ty Cổ phần VNG',
      phone: '0911111111',
    });

    const candidate1 = await User.create({
      email: 'candidate1@example.com',
      password: 'password123',
      role: 'candidate',
      name: 'Trần Thị B',
      phone: '0987654321',
    });

    const candidate2 = await User.create({
      email: 'candidate2@example.com',
      password: 'password123',
      role: 'candidate',
      name: 'Lê Văn C',
      phone: '0901234567',
    });

    console.log('Created users (4 Employers, 2 Candidates)');

    // 2. Create Jobs
    const jobs = await Job.create([
      {
        employerId: employerKidsPlaza._id,
        title: 'Lập Trình Viên Web Front-End (ReactJS/NextJS)',
        description: 'Phối hợp với đội ngũ UI/UX chuyển đổi thiết kế (wireframes) thành mã nguồn thực tế; xây dựng các thành phần giao diện trực quan, tối ưu hiệu năng và đảm bảo khả năng bảo trì mã nguồn; tham gia toàn bộ vòng đời phát triển ứng dụng web.',
        requirements: 'Ít nhất 3 năm kinh nghiệm; thành thạo ReactJS, Next.js; kỹ năng Software Engineer; tốt nghiệp Đại học trở lên (Độ tuổi 21-30).',
        salary: '15,000,000 - 18,000,000 VND',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['ReactJS', 'Next.js', 'JavaScript', 'HTML5', 'CSS3'],
      },
      {
        employerId: employerFiny._id,
        title: 'Middle Backend Developer (Java/Spring Boot)',
        description: 'Phân tích yêu cầu nghiệp vụ, thiết kế hệ thống dịch vụ và cấu trúc cơ sở dữ liệu; phát triển các tính năng backend, thực hiện Unit Test và phối hợp với đội ngũ QC để đảm bảo chất lượng phần mềm.',
        requirements: 'Ít nhất 3 năm kinh nghiệm Backend; thành thạo Java, Spring Boot; kiến thức về RESTful API, Webservice; kinh nghiệm làm việc với Oracle, MySQL, PostgreSQL.',
        salary: '15,000,000 - 25,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Java', 'Spring Boot', 'RESTful API', 'MySQL', 'PostgreSQL'],
      },
      {
        employerId: employerQG._id,
        title: 'Senior Java Developer (Fullstack / Backend)',
        description: 'Phát triển hệ thống phần mềm quy mô lớn (hàng chục triệu giao dịch/ngày); xây dựng API, thiết kế database và thực hiện code review; tham gia vận hành, CI/CD và giải quyết bài toán về hiệu năng/bảo mật.',
        requirements: '4–8 năm kinh nghiệm (3–5 năm với Java); nắm vững OOP, Design Patterns; thành thạo Spring Boot; kinh nghiệm với Database (MySQL, MongoDB) và Docker/Kubernetes.',
        salary: 'Thỏa thuận',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Java', 'Spring Boot', 'MongoDB', 'Docker', 'Kubernetes', 'CI/CD'],
      },
      {
        employerId: employerVNG._id,
        title: 'Junior Web Developer (ReactJS)',
        description: 'Tham gia phát triển các sản phẩm Zalo Web, Zing MP3; làm việc cùng team UI/UX và Backend; review code và tối ưu performance.',
        requirements: '1-2 năm kinh nghiệm Frontend; hiểu sâu về JavaScript, DOM, ReactJS; có tư duy Product tốt.',
        salary: '10,000,000 - 15,000,000 VND',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['ReactJS', 'JavaScript', 'CSS', 'Redux'],
      },
      {
        employerId: employerVNG._id,
        title: 'Data Engineer (Python/SQL)',
        description: 'Xây dựng data pipeline; thu thập và xử lý big data từ các hệ thống; tối ưu hóa query database cho Analytics Team.',
        requirements: 'Ít nhất 2 năm kinh nghiệm Date Engineer; thành thạo Python, SQL; kinh nghiệm với Hadoop, Spark là lợi thế.',
        salary: '20,000,000 - 30,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Python', 'SQL', 'Hadoop', 'Spark', 'Big Data'],
      }
    ]);
    console.log('Created 5 real jobs from TopCV (including related jobs testing)');

    // 3. Create Applications
    const applications = await Application.create([
      // Apply to Frontend - Kids Plaza
      {
        jobId: jobs[0]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['ReactJS', 'Next.js', 'TypeScript', 'CSS'],
          experience: '3.5 years Frontend Developer',
          education: 'Cử nhân CNTT - Bách Khoa HCM',
        },
        status: 'interview',  // Sắp phỏng vấn
        appliedAt: new Date('2024-03-25'),
      },
      {
        jobId: jobs[0]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['ReactJS', 'VueJS', 'JavaScript'],
          experience: '2 năm làm Web Dev',
          education: 'ĐH KHTN',
        },
        status: 'pending',
        appliedAt: new Date('2024-03-28'),
      },
      
      // Apply to Backend - Finy
      {
        jobId: jobs[1]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
          experience: '3 năm Backend Java',
          education: 'Học viện PTIT',
        },
        status: 'accepted',
        appliedAt: new Date('2024-03-20'),
      },
      
      // Apply to Fullstack - QG VN
      {
        jobId: jobs[2]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['Java', 'React', 'Docker', 'K8s'],
          experience: '5 năm Fullstack',
          education: 'Thạc sĩ Khoa học Máy tính',
        },
        status: 'reviewed',
        appliedAt: new Date('2024-03-29'),
      }
    ]);
    console.log('Created 4 applications');

    // 4. Create Interviews
    await Interview.create([
      // Phỏng vấn Frontend
      {
        applicationId: applications[0]._id,
        scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
        location: 'Tầng 4, Tòa nhà A, Quận 10, HCM',
        note: 'Phỏng vấn kỹ thuật trực tiếp (Live coding)',
        status: 'scheduled',
      },
      // Phỏng vấn Backend đã xong -> Accepted
      {
        applicationId: applications[2]._id,
        scheduledAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        location: 'Online qua Google Meet',
        note: 'Vòng Final - Phỏng vấn với CTO',
        status: 'completed',
        result: 'passed',
      }
    ]);
    console.log('Created 2 interviews');

    console.log('\n✅ Seed data (3 Công Ty) created successfully!');
    console.log('\n--- Accounts Testing ---');
    console.log('🏭 Employer 1 (Kids Plaza): kidsplaza@example.com / password123');
    console.log('🏭 Employer 2 (Finy): finy@example.com / password123');
    console.log('🏭 Employer 3 (QG VN): qgvn@example.com / password123');
    console.log('👩‍💻 Candidate 1: candidate1@example.com / password123');
    console.log('👨‍💻 Candidate 2: candidate2@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
