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

    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const empData = [
      { email: 'kidsplaza@example.com', name: 'Công ty Cổ phần Kids Plaza', phone: '0912345671', companyLogo: 'https://vcdn.tikicdn.com/ts/seller/f6/bb/e4/f05e3f3cfbcc1bc4102c77d5ec9268ed.jpg' },
      { email: 'thegioididong@example.com', name: 'Công ty CP Đầu tư Thế Giới Di Động', phone: '0912345672', companyLogo: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-The-Gioi-Di-Dong-MWG.png' },
      { email: 'fptshop@example.com', name: 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT (FPT Shop)', phone: '0912345673', companyLogo: 'https://biztech.vn/wp-content/uploads/2021/04/logo-fpt.png' },
      { email: 'vng@example.com', name: 'Công ty Cổ phần VNG', phone: '0912345674', companyLogo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VNG.png' },
      { email: 'viettel@example.com', name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)', phone: '0912345675', companyLogo: 'https://vtmc.vn/images/Logo_Viettel.png' },
      { email: 'shopee@example.com', name: 'Công ty TNHH Shopee', phone: '0912345676', companyLogo: 'https://images.seeklogo.com/logo-png/53/2/shopee-logo-png_seeklogo-530807.png' },
      { email: 'tiki@example.com', name: 'Công ty Cổ phần TiKi', phone: '0912345677', companyLogo: 'https://chongiatot.com.vn/wp-content/uploads/2025/07/ma-giam-gia-tiki-logo.png' },
      { email: 'vinmec@example.com', name: 'Hệ thống Y tế Vinmec', phone: '0912345678', companyLogo: 'https://congtyquatang.com.vn/wp-content/uploads/2026/03/logo-vinmec-vector-scaled.png' },
      { email: 'techcombank@example.com', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)', phone: '0912345679', companyLogo: 'https://inkythuatso.com/uploads/images/2021/09/logo-techcombank-inkythuatso-10-15-11-46.jpg' },
      { email: 'vnpt@example.com', name: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)', phone: '0912345670', companyLogo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjAT6-Z5apYFiLNyUjK8Inr-I-8RKzXa_4wQ&s' },
      // Mới thêm
      { email: 'vingroup@example.com', name: 'Tập đoàn Vingroup', phone: '0912345681', companyLogo: 'https://vinhomes.vn/assets/images/logo_vingroup.png' },
      { email: 'masan@example.com', name: 'Công ty Cổ phần Tập đoàn Masan', phone: '0912345682', companyLogo: 'https://masangroup.com/wp-content/uploads/2022/10/Masan-Logo-01.png' },
      { email: 'highlands@example.com', name: 'Highlands Coffee', phone: '0912345683', companyLogo: 'https://www.highlandscoffee.com.vn/vnt_upload/weblink/1638367980_highlands-logo.png' },
      { email: 'vnairlines@example.com', name: 'Vietnam Airlines', phone: '0912345684', companyLogo: 'https://www.vietnamairlines.com/~/media/Images/HeroImage/Logo/vna-logo-vn.png' },
      { email: 'vietcombank@example.com', name: 'Ngân hàng TMCP Ngoại Thương VN (Vietcombank)', phone: '0912345685', companyLogo: 'https://portal.vietcombank.com.vn/en-us/about/cr/PublishingImages/Logo%20VCB.png' },
      { email: 'uniqlo@example.com', name: 'Uniqlo Việt Nam', phone: '0912345686', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/1024px-UNIQLO_logo.svg.png' },
      { email: 'cgv@example.com', name: 'CGV Cinemas Việt Nam', phone: '0912345687', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/CGV_logo.svg/2560px-CGV_logo.svg.png' },
      { email: 'momo@example.com', name: 'Công ty Cổ phần Dịch vụ Di Động Trực tuyến (Momo)', phone: '0912345688', companyLogo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
      { email: 'bitis@example.com', name: 'Biti\'s Việt Nam', phone: '0912345689', companyLogo: 'https://bitis.com.vn/images/logo.png' },
      { email: 'hm@example.com', name: 'H&M Việt Nam', phone: '0912345690', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1024px-H%26M-Logo.svg.png' },
      { email: 'pnj@example.com', name: 'Công ty CP Vàng Bạc Đá Quý Phú Nhuận (PNJ)', phone: '0912345691', companyLogo: 'https://cdn.pnj.io/images/logo/pnj.com.vn.png' },
      { email: 'kiotviet@example.com', name: 'KiotViet (Công ty Cổ phần Phần mềm Citigo)', phone: '0912345692', companyLogo: 'https://www.kiotviet.vn/wp-content/themes/kiotviet/assets/images/logo.png' },
      { email: 'ghtk@example.com', name: 'Giao Hàng Tiết Kiệm (GHTK)', phone: '0912345693', companyLogo: 'https://images.careerbuilder.vn/employer_folders/lot9/244309/7811613ghtk-logo.png' },
      { email: 'begroup@example.com', name: 'Công ty Cổ phần Be Group', phone: '0912345694', companyLogo: 'https://be.com.vn/wp-content/uploads/2021/04/Be_Logo_Yellow.png' },
      { email: 'fptsoftware@example.com', name: 'FPT Software', phone: '0912345695', companyLogo: 'https://fptsoftware.com/-/media/project/fpt-software/fso/common/fpt-software-logo.png' },
      { email: 'sungroup@example.com', name: 'Tập đoàn Sun Group', phone: '0912345696', companyLogo: 'https://sungroup.com.vn/wp-content/uploads/2020/09/Logo-Sun-Group.png' },
      { email: 'cfit@example.com', name: 'California Fitness & Yoga', phone: '0912345697', companyLogo: 'https://cali.vn/storage/app/media/2021/Logo/Cali_Logo_Red.png' },
      { email: 'goldengate@example.com', name: 'Golden Gate Restaurant Group', phone: '0912345698', companyLogo: 'https://sss.phongkham.com/wp-content/uploads/2022/10/Golden-Gate-Logo.png' },
      { email: 'lalamove@example.com', name: 'Lalamove Việt Nam', phone: '0912345699', companyLogo: 'https://www.lalamove.com/hubfs/Lalamove%20Website%202020/Lalamove_Logo_Orange.png' },
      { email: 'vinhomes@example.com', name: 'Công ty Cổ phần Vinhomes', phone: '0912345600', companyLogo: 'https://vinhomes.vn/assets/images/logo_light.svg' },
    ];

    const employers = await Promise.all(empData.map(e => 
      User.create({
        email: e.email,
        password: 'password123',
        role: 'employer',
        name: e.name,
        phone: e.phone,
        companyLogo: e.companyLogo,
      })
    ));

    const candidates = await Promise.all([
      User.create({ email: 'candidate1@example.com', password: 'password123', role: 'candidate', name: 'Trần Thị A', phone: '0987654321' }),
      User.create({ email: 'candidate2@example.com', password: 'password123', role: 'candidate', name: 'Lê Văn B', phone: '0987654322' }),
      User.create({ email: 'candidate3@example.com', password: 'password123', role: 'candidate', name: 'Nguyễn Văn C', phone: '0987654323' }),
    ]);

    // Tài khoản admin
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      name: 'Quản trị viên',
      isActive: true,
    });
    console.log(`Admin account: admin@example.com / admin123`);

    console.log(`Created ${employers.length} Employers, ${candidates.length} Candidates, 1 Admin`);

    const E = employers.map(e => e._id);

    const jobsData = [
      {
        employerId: E[0], // Kids Plaza
        title: 'Nhân Viên Bán Hàng Siêu Thị (Mẹ bé) - Quận 10',
        description: '- Cập nhật và nắm vững kiến thức sản phẩm để tư vấn.\n- Quản lý sắp xếp hàng hóa trên quầy kệ.\n- Thực hiện quy trình thanh toán.\n- Hỗ trợ giải đáp khiếu nại của khách.',
        requirements: '- Nam/Nữ từ 18 - 28 tuổi, ngoại hình ưa nhìn.\n- Không yêu cầu kinh nghiệm.\n- Giao tiếp thân thiện, niềm nở.\n- Có thể làm việc xoay ca.',
        benefits: '- Thu nhập: 6.000.000 - 9.000.000 VNĐ.\n- Thưởng lễ, Tết, tháng 13.\n- BHYT, BHXH đầy đủ.',
        salary: { min: 6000000, max: 9000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Giao tiếp', 'Bán hàng', 'Chăm sóc khách hàng']
      },
      {
        employerId: E[1], // TGDD
        title: 'Quản Lý Siêu Thị Thực Tập Bách Hóa Xanh',
        description: '- Đảm bảo doanh thu, lợi nhuận của siêu thị.\n- Quản lý, phân công công việc cho nhân viên.\n- Kiểm soát hàng hóa, giảm hao hụt.',
        requirements: '- Nam/Nữ, 22-30 tuổi.\n- Tốt nghiệp Cao đẳng/Đại học.\n- Có kinh nghiệm quản lý hoặc trưởng nhóm.',
        benefits: '- Thu nhập: 15.000.000 - 20.000.000 VNĐ.\n- Đào tạo kỹ năng quản lý bài bản.\n- Cơ hội thăng tiến lên AM.',
        salary: { min: 15000000, max: 20000000 },
        location: 'Bình Dương',
        jobType: 'full-time',
        skills: ['Quản lý', 'Leadership', 'Bán lẻ']
      },
      {
        employerId: E[3], // VNG
        title: 'Lập Trình Viên Web Frontend (ReactJS/NextJS)',
        description: '- Phát triển Frontend cho ZaloPay, Zing MP3.\n- Phối hợp với UI/UX Designer và Backend.\n- Tối ưu hiệu năng, fix bug.',
        requirements: '- 2+ năm kinh nghiệm React, Next.js.\n- Biết Redux/Zustand.\n- Làm việc nhóm tốt.',
        benefits: '- Lương lên tới $1500.\n- Macbook Pro.\n- Gym, Hồ bơi miễn phí.',
        salary: { min: 25000000, max: 37500000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['ReactJS', 'NextJS', 'TypeScript']
      },
      {
        employerId: E[3], // VNG
        title: 'Data Engineer (Big Data / Spark)',
        description: '- Phát triển Data Pipeline, luân chuyển TB dữ liệu.\n- Xây dựng Data Warehouse.\n- Làm việc với Spark, Kafka, Airflow.',
        requirements: '- 2+ năm kinh nghiệm Data Engineer.\n- Biết Python/Scala/Java.\n- Kiến thức RDBMS và NoSQL.',
        benefits: '- Lương $1200 - $2000.\n- Thưởng hiệu quả hoạt động 1-3 tháng lương.',
        salary: { min: 30000000, max: 50000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Python', 'Spark', 'Hadoop', 'Kafka']
      },
      {
        employerId: E[4], // Viettel
        title: 'DevOps Engineer (Kubernetes, AWS)',
        description: '- Vận hành hạ tầng Cloud cho các dự án quan trọng.\n- Quản lý quy trình CI/CD.\n- Triển khai Kubernetes (K8S).',
        requirements: '- Tốt nghiệp khá/giỏi ngành CNTT.\n- 2-3 năm kinh nghiệm DevOps.\n- Thành thạo Linux, Docker, Ansible.',
        benefits: '- Lương lên đến 35 triệu.\n- Phụ cấp điện thoại, ăn trưa.\n- Cơ hội làm việc với hệ thống lớn nhất ĐNÁ.',
        salary: { min: 25000000, max: 35000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['DevOps', 'Kubernetes', 'CI/CD', 'Linux']
      },
      {
        employerId: E[8], // Techcombank
        title: 'Senior Backend Developer (Java Spring)',
        description: '- Thiết kế hệ thống Microservices xử lý giao dịch cao cho TCB Mobile.\n- Tích hợp Core Banking và Open API.',
        requirements: '- 4-7 năm kinh nghiệm Java Spring Boot.\n- Hiểu sâu về Kafka, Oracle, Redis.\n- Giỏi Design Patterns.',
        benefits: '- 16 tháng lương/năm.\n- Gói vay ưu đãi mua nhà từ 1.5%.\n- Mac / Màn hình kép.',
        salary: { min: 35000000, max: 60000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Java', 'Spring Boot', 'Microservices']
      },
      {
        employerId: E[5], // Shopee
        title: 'Business Analyst (E-Commerce Platform)',
        description: '- Thu thập yêu cầu từ Marketing, Finance.\n- Viết tài liệu BRD, FRS, UI Wireframe.\n- Quản lý Product Backlog.',
        requirements: '- 3 năm kinh nghiệm BA mảng E-Commerce.\n- Tiếng Anh giao tiếp tự tin.\n- Thành thạo Figma, Jira.',
        benefits: '- Mức lương siêu cạnh tranh.\n- Xét tăng lương 2 lần/năm.\n- Quyền mua cổ phiếu Shopee.',
        salary: { min: 25000000, max: 35000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['BA', 'Agile', 'E-commerce', 'English']
      },
      {
        employerId: E[6], // Tiki
        title: 'QC/QA Tester (Manual & Automation)',
        description: '- Kiểm thử Web/App trên nền tảng Tiki.\n- Viết Test case, Test plan.\n- Log bug cẩn thận.',
        requirements: '- 1.5 năm kinh nghiệm Tester.\n- Biết API Testing, viết SQL cơ bản.\n- Hiểu về Agile Scrum.',
        benefits: '- Thu nhập 12-18 triệu.\n- Trợ cấp cơm trưa.\n- Làm thứ 2 - thứ 6.',
        salary: { min: 12000000, max: 18000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Manual Test', 'API Testing', 'SQL']
      },
      {
        employerId: E[9], // VNPT
        title: 'Chuyên Viên IT Helpdesk, Hỗ Trợ Kỹ Thuật',
        description: '- Quản trị mạng nội bộ LAN, WAN của VNPT.\n- Hỗ trợ End-User xử lý lỗi PC, Printer, Mail.\n- Quản trị Windows Server, Active Directory.',
        requirements: '- Có chứng chỉ MCSA/CCNA là lợi thế.\n- Ít nhất 1 năm kinh nghiệm IT Support.\n- Chăm chỉ, sẵn sàng hỗ trợ ngoài giờ.',
        benefits: '- Lương 10 - 15 triệu.\n- Chế độ nhà nước.\n- Đào tạo chứng chỉ quốc tế.',
        salary: { min: 10000000, max: 15000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['IT Support', 'Network', 'Hardware']
      },
      {
        employerId: E[7], // Vinmec
        title: 'Chuyên Viên Vận Hành Công Nghệ Y Tế (HIS)',
        description: '- Vận hành phần mềm bệnh viện HIS, LIS, PACS.\n- Hỗ trợ Bác sĩ/Điều dưỡng sử dụng phần mềm.\n- Viết hướng dẫn, ghi nhận lỗi gửi lên Dev.',
        requirements: '- Tốt nghiệp Đại học CNTT / Tin học Y tế.\n- Ít nhất 1 năm kinh nghiệm phần mềm y tế.\n- Nhẫn nại, mềm mỏng.',
        benefits: '- Lương 15-20 triệu.\n- Thẻ khám sức khỏe đặc quyền Vinmec.\n- Hỗ trợ cơm tại canteen 5 sao.',
        salary: { min: 15000000, max: 20000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['HIS', 'IT Helpdesk', 'System Deployment']
      },
      {
        employerId: E[10], // Vingroup
        title: 'Chuyên viên Marketing Truyền thông nội bộ',
        description: '- Xây dựng kế hoạch truyền thông nội bộ cho Tập đoàn.\n- Viết bài, tổ chức sự kiện.\n- Tăng cường văn hóa doanh nghiệp.',
        requirements: '- Đại học chuyên ngành Marketing/PR.\n- Có khả năng viết lách, lên kịch bản.\n- Năng động, sáng tạo.',
        benefits: '- Lương: Thỏa thuận.\n- Thưởng cuối năm, phúc lợi Vingroup.\n- Làm việc tại Landmark 81.',
        salary: { min: 18000000, max: 25000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Marketing', 'Copywriting', 'Event Management']
      },
      {
        employerId: E[11], // Masan
        title: 'Chuyên viên Nhân sự (Talent Acquisition)',
        description: '- Phụ trách tuyển dụng khối Back-office và Sale.\n- Sàng lọc hồ sơ, tổ chức phỏng vấn.\n- Mở rộng nguồn ứng viên qua các kênh.',
        requirements: '- Tối thiểu 2 năm kinh nghiệm Tuyển dụng.\n- Giao tiếp tốt, chịu áp lực.\n- Nhạy bén trong việc đánh giá con người.',
        benefits: '- Thu nhập: 15.000.000 - 22.000.000 VNĐ.\n- Chế độ bảo hiểm cao cấp.\n- Cơ hội làm việc tại Tập đoàn tỷ đô.',
        salary: { min: 15000000, max: 22000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Tuyển dụng', 'HR', 'Giao tiếp']
      },
      {
        employerId: E[12], // Highlands
        title: 'Cửa Hàng Trưởng - Highlands Coffee',
        description: '- Chịu trách nhiệm doanh thu, chất lượng dịch vụ của quán.\n- Quản lý đội ngũ nhân viên ca (10-20 người).\n- Quản lý nguyên vật liệu, tránh thất thoát.',
        requirements: '- 2-3 năm làm F&B, 1 năm ở vị trí quản lý.\n- Nam/Nữ, làm theo ca.\n- Leadership tốt.',
        benefits: '- Thưởng doanh số hàng tháng.\n- Đào tạo quản lý chuẩn F&B.\n- Lương: 12 - 16 triệu.',
        salary: { min: 12000000, max: 16000000 },
        location: 'Đà Nẵng',
        jobType: 'full-time',
        skills: ['F&B', 'Store Manager', 'Leadership']
      },
      {
        employerId: E[13], // VN Airlines
        title: 'Tiếp Viên Hàng Không (Cabin Crew)',
        description: '- Phục vụ và đảm bảo an toàn cho hành khách trên chuyến bay.\n- Hướng dẫn thực hiện các quy định an toàn.\n- Giải quyết các tình huống phát sinh.',
        requirements: '- Tiếng Anh TOEIC >= 600.\n- Nữ cao 1m58 - 1m75, Nam cao 1m68 - 1m82.\n- Ngoại hình ưa nhìn, sức khỏe tốt.',
        benefits: '- Thu nhập: 20.000.000 - 30.000.000 VNĐ.\n- Bay nội địa và quốc tế.\n- Vé máy bay miễn phí cho gia đình.',
        salary: { min: 20000000, max: 30000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Tiếng Anh', 'Giao tiếp', 'Customer Service']
      },
      {
        employerId: E[14], // Vietcombank
        title: 'Giao Dịch Viên Khách Hàng Cá Nhân',
        description: '- Phục vụ tại quầy: mở tài khoản, chuyển tiền, tiết kiệm.\n- Tư vấn các dịch vụ ngân hàng cơ bản.\n- Đảm bảo tính minh bạch, chính xác số liệu.',
        requirements: '- Tốt nghiệp Đại học Khối ngành Kinh tế/Tài chính.\n- Ngoại hình sáng.\n- Tiếng Anh giao tiếp cơ bản.',
        benefits: '- Lương cơ bản: 13-18 triệu + Thưởng kinh doanh.\n- Chế độ đãi ngộ ngân hàng nhà nước rất tốt.\n- Môi trường chuyên nghiệp.',
        salary: { min: 13000000, max: 18000000 },
        location: 'Nha Trang',
        jobType: 'full-time',
        skills: ['Tài chính', 'Kế toán', 'Giao tiếp']
      },
      {
        employerId: E[15], // Uniqlo
        title: 'Trợ Lý Cửa Hàng Bán Lẻ (Uniqlo Manager Candidate)',
        description: '- Tham gia chương trình đào tạo quản lý cấp tốc của Uniqlo.\n- Trực tiếp bán hàng, tư vấn cho khách.\n- Sắp xếp và quản lý kho hàng chuẩn Nhật.',
        requirements: '- Sinh viên mới tốt nghiệp hoặc <3 năm kinh nghiệm.\n- Thích ngành thời trang.\n- Tiếng Anh lưu loát.',
        benefits: '- Lương khởi điểm: 16.000.000 VNĐ.\n- Cơ hội đi Nhật đào tạo.\n- Lộ trình thăng tiến siêu nhanh.',
        salary: { min: 16000000, max: 20000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Tiếng Anh', 'Bán lẻ', 'Thời trang']
      },
      {
        employerId: E[16], // CGV
        title: 'Nhân viên Phục Vụ Rạp Phim (Part-time)',
        description: '- Bán vé, kiểm soát vé vào rạp.\n- Phục vụ bắp nước tại quầy.\n- Dọn dẹp phòng chiếu sau ca chiếu.',
        requirements: '- Sinh viên từ 18-22 tuổi.\n- Làm việc tối thiểu 20h/tuần.\n- Giao tiếp vui vẻ.',
        benefits: '- Lương 30k/giờ.\n- Tặng vé xem phim hàng tháng.\n- Môi trường vui vẻ năng động.',
        salary: { min: 2000000, max: 5000000 },
        location: 'Biên Hòa',
        jobType: 'part-time',
        skills: ['Part-time', 'Giao tiếp']
      },
      {
        employerId: E[17], // Momo
        title: 'Data Analyst (User Behavior Tracking)',
        description: '- Phân tích dữ liệu hành vi người dùng Momo app.\n- Làm Dashboard báo cáo cho Ban Giám Đốc.\n- Hợp tác với team Marketing triển khai Campaign.',
        requirements: '- Giỏi SQL, Excel, Tableau/PowerBI.\n- 2 năm kinh nghiệm BA/DA.\n- Nhạy bén với số liệu.',
        benefits: '- Package thu nhập 14 tháng lương.\n- Cung cấp thiết bị xịn.\n- Văn phòng đẹp như Google.',
        salary: { min: 20000000, max: 35000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['SQL', 'PowerBI', 'Data Analysis']
      },
      {
        employerId: E[18], // Bitis
        title: 'Nhân viên Quản Lý Kho Trung Tâm',
        description: '- Nhận hàng thành phẩm, kiểm đếm số lượng.\n- Đóng gói, xuất hàng cho đại lý/cửa hàng.\n- Báo cáo tồn kho định kỳ.',
        requirements: '- Nam ưu tiên, có sức khỏe.\n- Biết dùng máy tính cơ bản Excel.\n- Cẩn thận, trung thực.',
        benefits: '- Thu nhập: 8-10 triệu.\n- Phụ cấp cơm trưa.\n- Lương tháng 13.',
        salary: { min: 8000000, max: 10000000 },
        location: 'Đồng Nai',
        jobType: 'full-time',
        skills: ['Quản lý kho', 'Excel']
      },
      {
        employerId: E[19], // H&M
        title: 'Visual Merchandiser (Sắp xếp không gian cửa hàng)',
        description: '- Trưng bày manơcanh, sắp xếp layout trang phục theo campaign.\n- Đảm bảo ánh sáng, màu sắc cửa hàng thu hút.\n- Cập nhật xu hướng thời trang toàn cầu.',
        requirements: '- Background về Thời trang/Thiết kế/Mỹ thuật.\n- Có gu thẩm mỹ tốt.\n- Tiếng Anh giao tiếp.',
        benefits: '- Lương: 12-18 triệu.\n- Discount 25% mua đồ H&M toàn cầu.\n- Được đào tạo với chuyên gia quốc tế.',
        salary: { min: 12000000, max: 18000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Design', 'Fashion', 'Sáng tạo']
      },
      {
        employerId: E[20], // PNJ
        title: 'Chuyên Viên Tư Vấn Khách Hàng (Jewelry)',
        description: '- Tư vấn chọn trang sức (vàng, bạc, kim cương) theo nhu cầu khách.\n- Giải đáp thắc mắc, chăm sóc hậu mãi.\n- Vệ sinh tủ kệ trưng bày sáng bóng.',
        requirements: '- Ngoại hình sáng, Nữ cao >1m58.\n- Khéo léo trong giao tiếp, giọng nói chuẩn.\n- Kinh nghiệm bán lẻ hàng cao cấp là điểm cộng.',
        benefits: '- Hoa hồng cá nhân không giới hạn.\n- Chế độ bảo hiểm và du lịch hàng năm.\n- Thưởng lễ, Tết hậu hĩnh.',
        salary: { min: 9000000, max: 20000000 },
        location: 'Đà Nẵng',
        jobType: 'full-time',
        skills: ['Tư vấn', 'Chăm sóc khách hàng']
      },
      {
        employerId: E[21], // KiotViet
        title: 'Nhân Viên Telesales (Phần Mềm Quản Lý Bán Hàng)',
        description: '- Gọi điện tư vấn chủ cửa hàng tiện lợi, nhà thuốc sử dụng PM Kiotviet.\n- Theo sát khách để chốt hợp đồng dịch vụ phần mềm.\n- Quản lý CRM.',
        requirements: '- Tự tin qua điện thoại.\n- Chịu khó, kiên trì.\n- 0 kinh nghiệm sẽ được đào tạo.',
        benefits: '- Lương cứng 7-9tr + Hoa hồng cao (Tổng >20tr).\n- Lộ trình thăng tiến làm Nhóm trưởng sau 6 tháng.',
        salary: { min: 10000000, max: 25000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Telesales', 'Bán hàng', 'Giao tiếp']
      },
      {
        employerId: E[22], // GHTK
        title: 'Điều Phối Bưu Cục (Hub Manager)',
        description: '- Quản lý tài sản bưu cục, điều phối tài xế lấy/giao hàng.\n- Xử lý các khiếu nại của đối tác shop bán hàng.\n- Kiểm soát tỷ lệ giao hàng thành công.',
        requirements: '- Tốt nghiệp Cao đẳng/Đại học.\n- Chịu được áp lực cao mảng logistics.\n- Xử lý tình huống tốt.',
        benefits: '- Lương cơ bản 12 triệu + KPI (Tổng 15-20 triệu).\n- Được cấp máy tính làm việc.\n- Cơ hội thăng tiến quản lý cụm.',
        salary: { min: 15000000, max: 20000000 },
        location: 'Bến Tre',
        jobType: 'full-time',
        skills: ['Logistics', 'Quản lý', 'Điều phối']
      },
      {
        employerId: E[23], // Be Group
        title: 'Product Manager (Ride Hailing)',
        description: '- Thiết kế các feature mới cho app Be.\n- Phối hợp với Dev, QA, Data, Business để Launch Product.\n- Đo lường và tối ưu hóa conversion rate.',
        requirements: '- Ít nhất 3 năm kinh nghiệm làm Product cho Mobile App.\n- Nhạy bén thị trường gọi xe/delivery.\n- Giao tiếp và quản trị stackholder tốt.',
        benefits: '- Thu nhập: Up to $2500.\n- Cổ phiếu ưu đãi.\n- Flexible working hours.',
        salary: { min: 40000000, max: 60000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Product Management', 'Agile', 'Mobile App']
      },
      {
        employerId: E[24], // FPT Software
        title: 'Lập trình viên Mobile iOS/Android (Cấp Senior)',
        description: '- Viết code Swift / Kotlin phát triển ứng dụng ngân hàng quốc tế.\n- Đảm bảo app chạy mượt, không crash.\n- Tham gia cùng team Japan/US.',
        requirements: '- 4 năm kinh nghiệm mobile app.\n- Biết sử dụng Git, CI/CD.\n- Tiếng Anh khá / Tiếng Nhật N3 là lợi thế khổng lồ.',
        benefits: '- Package thu nhập 50-70 triệu.\n- Tham gia onsite nước ngoài (Nhật / Mỹ).\n- Healthcare riêng biệt.',
        salary: { min: 50000000, max: 70000000 },
        location: 'Đà Nẵng',
        jobType: 'full-time',
        skills: ['iOS', 'Android', 'Swift', 'Kotlin']
      },
      {
        employerId: E[25], // Sun Group
        title: 'Kế Toán Trưởng dự án Resort',
        description: '- Theo dõi dòng tiền, chi phí, vật tư xây dựng dự án resort 5 sao.\n- Lập báo cáo tài chính hàng tháng/năm.\n- Làm việc với cơ quan thuế.',
        requirements: '- Chứng chỉ Kế Toán Trưởng.\n- 5 năm kinh nghiệm về Bất động sản / Xây dựng.\n- Có thể đi công tác.',
        benefits: '- Thu nhập: 25 - 40 triệu.\n- Chế độ đãi ngộ nội bộ đi cáp treo Bà Nà miễn phí.\n- Thưởng dự án rất cao.',
        salary: { min: 25000000, max: 40000000 },
        location: 'Phú Quốc',
        jobType: 'full-time',
        skills: ['Kế toán', 'Tài chính', 'Thuế']
      },
      {
        employerId: E[26], // Cali Fitness
        title: 'Huấn luyện viên Cá nhân (Personal Trainer)',
        description: '- Hướng dẫn hội viên tập luyện Gym/Fitness an toàn.\n- Tư vấn chế độ dinh dưỡng.\n- Chốt hợp đồng các khóa tập cá nhân (PT).',
        requirements: '- Ngoại hình thể thao đẹp.\n- Có chứng chỉ PT trong nước/quốc tế.\n- Kỹ năng sale mạnh mẽ.',
        benefits: '- Lương cứng + Hoa hồng PT cao (Tổng >30 triệu).\n- Tập gym miễn phí suốt đời tại trung tâm.\n- Du lịch teambuilding.',
        salary: { min: 20000000, max: 40000000 },
        location: 'Cần Thơ',
        jobType: 'full-time',
        skills: ['Fitness', 'Sales', 'Dinh dưỡng']
      },
      {
        employerId: E[27], // Golden gate
        title: 'Bếp Trưởng / Đầu bếp Nhà Hàng Manwah',
        description: '- Quản lý khu vực bếp lẩu (nước lẩu, cắt thịt, rau).\n- Giữ gìn vệ sinh an toàn thực phẩm.\n- Đào tạo nhân viên phụ bếp mới.',
        requirements: '- Kinh nghiệm bếp hoa hoặc lẩu >2 năm.\n- Chăm chỉ, chịu được sức nóng nhà bếp.\n- Khả năng quản lý nhân sự.',
        benefits: '- Thu nhập 15-20 triệu.\n- Ăn 2 bữa tại nhà hàng.\n- Thưởng doanh thu chi nhánh.',
        salary: { min: 15000000, max: 20000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Nấu ăn', 'Quản lý Bếp', 'F&B']
      },
      {
        employerId: E[28], // Lalamove
        title: 'Operations Executive (Nhân viên Điều phối xe tải)',
        description: '- Mở rộng và chăm sóc mạng lưới đối tác tài xế xe tải/xe máy.\n- Training tài xế mới phần mềm Lalamove.\n- Giải quyết sự cố hư hỏng hàng hóa.',
        requirements: '- 1 năm kinh nghiệm Operations/Logistics.\n- Giao tiếp thân thiện với tài xế.\n- Năng động, hoạt bát.',
        benefits: '- Lương 12-16 triệu.\n- Môi trường Startup kỳ lân năng động.\n- Nghỉ lễ theo lịch nhà nước.',
        salary: { min: 12000000, max: 16000000 },
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Logistics', 'Operations', 'Giao tiếp']
      },
      {
        employerId: E[29], // Vinhomes
        title: 'Chuyên viên Tư vấn Bất Động Sản (Real Estate Broker)',
        description: '- Tìm kiếm khách hàng VIP mua Vinhomes Ocean Park, Grand Park.\n- Tư vấn pháp lý, thủ tục vay ngân hàng.\n- Dẫn khách đi xem sa bàn dự án thực tế.',
        requirements: '- Tự tin, ngoại hình thanh lịch.\n- Có phương tiện cá nhân.\n- Laptop cá nhân.',
        benefits: '- Lương cứng hỗ trợ 5.000.000 + Hoa hồng cao ngất (từ 50-200tr/căn).\n- Bán được nhà thu nhập tỷ đồng/năm.\n- Đào tạo bán hàng siêu việt.',
        salary: { min: 5000000, max: 200000000 },
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Sales', 'Bất Động Sản', 'Tư vấn']
      }
    ];

    const insertedJobs = await Job.insertMany(jobsData);
    console.log(`Created ${insertedJobs.length} diverse jobs across 30 companies.`);

    const applications = await Application.create([
      {
        jobId: insertedJobs[0]._id, // Kids Plaza
        candidateId: candidates[0]._id, 
        parsedCV: { skills: ['Bán hàng', 'Giao tiếp'], experience: '1 năm làm Circle K', education: 'Tốt nghiệp THPT' },
        status: 'interview',
        appliedAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        jobId: insertedJobs[2]._id, // Frontend VNG
        candidateId: candidates[1]._id,
        parsedCV: { skills: ['ReactJS', 'NextJS', 'TypeScript'], experience: '2 năm làm Frontend', education: 'Đại Học Khoa Học Tự Nhiên' },
        status: 'pending',
        appliedAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        jobId: insertedJobs[5]._id, // Backend Techcombank
        candidateId: candidates[2]._id,
        parsedCV: { skills: ['Java', 'Spring', 'Kafka'], experience: '5 năm Backend Systems', education: 'Đại học Bách Khoa HN' },
        status: 'accepted',
        appliedAt: new Date(Date.now() - 10 * 86400000),
      }
    ]);
    console.log('Created applications');

    await Interview.create([
      {
        applicationId: applications[0]._id,
        scheduledAt: new Date(Date.now() + 2 * 86400000),
        location: 'Kids Plaza - Siêu thị Quận 10',
        note: 'Phỏng vấn kỹ năng xử lý tình huống',
        status: 'scheduled',
      },
      {
        applicationId: applications[2]._id,
        scheduledAt: new Date(Date.now() - 2 * 86400000),
        location: 'Techcombank Tower - Bà Triệu, Hà Nội',
        note: 'System Design Interview & Culture Fit',
        status: 'completed',
        result: 'passed',
      }
    ]);
    console.log('Created interviews');

    console.log('\n==================================');
    console.log('🌟 SEED DATA COMPLETE (30 COMPANIES & 30 JOBS) 🌟');
    console.log('Run `npm run dev` to see the beautiful TopCV-like data!');
    console.log('==================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
