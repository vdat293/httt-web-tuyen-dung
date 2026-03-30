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

    // ==========================================
    // 1. CREATE 10 EMPLOYERS AND 3 CANDIDATES
    // ==========================================
    const empData = [
      { email: 'kidsplaza@example.com', name: 'Công ty Cổ phần Kids Plaza', phone: '0912345671' },
      { email: 'thegioididong@example.com', name: 'Công ty CP Đầu tư Thế Giới Di Động', phone: '0912345672' },
      { email: 'fptshop@example.com', name: 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT (FPT Shop)', phone: '0912345673' },
      { email: 'vng@example.com', name: 'Công ty Cổ phần VNG', phone: '0912345674' },
      { email: 'viettel@example.com', name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)', phone: '0912345675' },
      { email: 'shopee@example.com', name: 'Công ty TNHH Shopee', phone: '0912345676' },
      { email: 'tiki@example.com', name: 'Công ty Cổ phần TiKi', phone: '0912345677' },
      { email: 'vinmec@example.com', name: 'Hệ thống Y tế Vinmec', phone: '0912345678' },
      { email: 'techcombank@example.com', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)', phone: '0912345679' },
      { email: 'vnpt@example.com', name: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)', phone: '0912345670' },
    ];

    const employers = await Promise.all(empData.map(e => 
      User.create({
        email: e.email,
        password: 'password123',
        role: 'employer',
        name: e.name,
        phone: e.phone,
      })
    ));

    const candidates = await Promise.all([
      User.create({ email: 'candidate1@example.com', password: 'password123', role: 'candidate', name: 'Trần Thị A', phone: '0987654321' }),
      User.create({ email: 'candidate2@example.com', password: 'password123', role: 'candidate', name: 'Lê Văn B', phone: '0987654322' }),
      User.create({ email: 'candidate3@example.com', password: 'password123', role: 'candidate', name: 'Nguyễn Văn C', phone: '0987654323' }),
    ]);

    console.log('Created 10 Employers & 3 Candidates');

    // Helper map
    const E = {
      KIDS_PLAZA: employers[0]._id, TGDD: employers[1]._id, FPT_SHOP: employers[2]._id,
      VNG: employers[3]._id, VIETTEL: employers[4]._id, SHOPEE: employers[5]._id,
      TIKI: employers[6]._id, VINMEC: employers[7]._id, TECHCOMBANK: employers[8]._id,
      VNPT: employers[9]._id
    };

    // ==========================================
    // 2. CREATE HIGHLY DETAILED JOBS (Mocking Real Data)
    // ==========================================
    const jobsData = [
      {
        employerId: E.KIDS_PLAZA,
        title: 'Nhân Viên Bán Hàng Siêu Thị (Mẹ bé)',
        description: '- Cập nhật và nắm vững kiến thức sản phẩm (sữa, tã, đồ ăn dặm,...) để tư vấn cho khách hàng một cách chính xác nhất.\n- Quản lý sắp xếp hàng hóa trên quầy kệ, đảm bảo không gian siêu thị luôn gọn gàng, sạch sẽ.\n- Thực hiện quy trình thanh toán, tính tiền cho khách tại quầy thu ngân.\n- Hỗ trợ giải đáp các khiếu nại, thắc mắc của khách hàng liên quan đến sản phẩm, dịch vụ.\n- Tham gia kiểm kê hàng hóa định kỳ theo tổ/nhóm.',
        requirements: '- Nam/Nữ từ 18 - 28 tuổi, sức khỏe tốt, ngoại hình ưa nhìn (Nam cao từ 1m60, Nữ cao từ 1m55).\n- Tốt nghiệp THPT trở lên. KHÔNG YÊU CẦU KINH NGHIỆM (Sẽ được đào tạo).\n- Giao tiếp thân thiện, niềm nở, có thái độ phục vụ khách hàng tốt.\n- Không vướng bận việc học, có thể làm việc xoay ca (Sáng: 8h-15h, Chiều: 14h30-21h30).\n- Biết dọn dẹp vệ sinh và yêu thích công việc bán hàng.',
        benefits: '- Thu nhập trung bình: 6.000.000 - 9.000.000 VNĐ/tháng (Lương CB + Phụ cấp + Thưởng doanh số).\n- Thưởng lễ, Tết, tháng lương thứ 13, thưởng hiệu quả công việc cá nhân và tập thể.\n- Được tham gia BHXH, BHYT, BHTN theo định của Pháp luật.\n- Nhận quà sinh nhật, tham gia Team Building, Year End Party,... thường niên.\n- Lộ trình thăng tiến rõ ràng lên Cửa hàng phó, Cửa hàng trưởng sau 6-12 tháng làm việc.',
        salary: '6,000,000 - 9,000,000 VND',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Kỹ năng giao tiếp', 'Tư vấn bán hàng', 'Làm việc theo ca']
      },
      {
        employerId: E.TGDD,
        title: 'Quản Lý Siêu Thị Thực Tập (Bách Hóa Xanh)',
        description: '- Đảm bảo doanh thu, lợi nhuận của siêu thị theo chỉ tiêu đề ra.\n- Quản lý, điều hành và phân công công việc cho đội ngũ nhân viên (khoảng 10-15 nhân sự).\n- Chịu trách nhiệm trực tiếp về vấn đề hao hụt hàng hóa, tiền bạc tại siêu thị.\n- Triển khai và giám sát các chương trình khuyến mãi, tiêu chuẩn trưng bày hàng hóa.\n- Tiếp nhận và xử lý nhanh chóng các phản hồi từ khách hàng, đảm bảo sự hài lòng cao nhất.',
        requirements: '- Nam/Nữ, ở độ tuổi từ 22 đến 30.\n- Tốt nghiệp Cao Đẳng/Đại Học các chuyên ngành Kinh tế, Quản trị kinh doanh hoặc liên quan.\n- Có ít nhất 1 năm kinh nghiệm làm Quản lý/Trưởng nhóm trong ngành Bán lẻ, Chuỗi cửa hàng (FMCG là lợi thế).\n- Sẵn sàng di chuyển, điều chuyển công tác theo yêu cầu của công ty.\n- Có kỹ năng xử lý tình huống, giải quyết vấn đề và chịu được áp lực cao trong công việc.',
        benefits: '- Thu nhập: 15.000.000 - 20.000.000 VNĐ/tháng tủy năng lực.\n- Được công ty cử đi học lớp Quản lý nội bộ, có người hướng dẫn riêng trong 2 tháng thử việc.\n- Cam kết môi trường làm việc công bằng, minh bạch, năng động.\n- Tham gia đầy đủ các chế độ Bảo hiểm.\n- Có lộ trình phát triển rõ ràng thăng tiến lên Quản lý khu vực (AM).',
        salary: '15,000,000 - 20,000,000 VND',
        location: 'Bình Dương',
        jobType: 'full-time',
        skills: ['Quản lý cửa hàng', 'Giải quyết vấn đề', 'Quản lý nhân sự']
      },
      {
        employerId: E.VNG,
        title: 'Lập Trình Viên Web Front-End (ReactJS/NextJS)',
        description: '- Phối hợp với đội ngũ UI/UX thiết kế từ Figma sang Frontend code (ReactJS/NextJS).\n- Phát triển các tính năng (Features) cho hệ thống cổng thanh toán ZaloPay (hoặc sản phẩm Zing MP3).\n- Tối ưu hóa hiệu suất ứng dụng web trên nhiều nền tảng (Desktop & Mobile).\n- Cùng với team BE để integrate JSON/RESTful APIs.\n- Review source code của các member khác và đề xuất công nghệ mới, hướng giải quyết tối ưu.\n- Phối hợp với QA, QC để xử lý bug và đảm bảo chất lượng phần mềm tốt nhất.',
        requirements: '- Tốt nghiệp Đại học chuyên ngành CNTT, Khoa học Máy tính hoặc các ngành liên quan.\n- Ít nhất 2 năm kinh nghiệm thực tế với React, Node.js hệ sinh thái Javascript.\n- Hiểu sâu về Javascript (ES6+), cấu trúc dữ liệu, và React hook (useEffect, useState, useRef).\n- Có kinh nghiệm với các công cụ quản lý state như (Redux, Zustand, React-query).\n- Quen thuộc với Git, Typescript và viết Unit test là một lợi thế.\n- Chủ động, trách nhiệm và có tinh thần team-work tốt.',
        benefits: '- Mức lương siêu cạnh tranh lên đến $1500 (chưa bao gồm xét duyệt hằng năm).\n- Thưởng tháng thứ 13 + thưởng performance cuối năm (tổng thu nhập có thể lên tới 15 tháng lương).\n- Được cấp Macbook Pro, thẻ ăn trưa, thẻ thể thao nội bộ miễn phí (Gym, Hồ bơi ngay tại campus).\n- Bảo hiểm sức khỏe PVI cao cấp dành cho nhân viên và người thân.\n- Môi trường làm việc mở, trẻ trung, tự do về trang phục (quần đùi, dép lê vẫn được).\n- Làm việc Hybrid linh hoạt.',
        salary: '$1000 - $1500',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['ReactJS', 'Next.js', 'JavaScript', 'TypeScript', 'CSS', 'Redux']
      },
      {
        employerId: E.VNG,
        title: 'Data Engineer (Big Data / Spark)',
        description: '- Tham gia phát triển hệ thống Data Pipeline, luân chuyển và xử lý hàng TB dữ liệu người dùng mỗi ngày.\n- Xây dựng và duy trì hệ thống Data Warehouse để phục vụ Data Analytics Team.\n- Làm việc chủ yếu với các công nghệ Big Data như Apache Spark, Hadoop, Kafka, Airflow.\n- Hỗ trợ xây dựng các hệ thống tracking real-time sử dụng Kafka, Flink.\n- Nghiên cứu công nghệ mới về xử lý dữ liệu và áp dụng vào dự án thực tế.',
        requirements: '- Hơn 2 năm kinh nghiệm ở vị trí Data Engineer hoặc Backend Developer sử dụng Python/Scala/Java.\n- Có kiến thức tốt về Database (Cả RDBMS và NoSQL) và khả năng tối ưu hóa các câu lệnh truy vấn phức tạp.\n- Kinh nghiệm về hệ sinh thái Big Data (Hadoop, Spark, Hive, Airflow) là một điểm cộng rất lớn.\n- Nắm vững các mô hình thiết kế Data Warehouse.\n- Có tư duy phân tích, tư duy hệ thống và khả năng tự học tốt.',
        benefits: '- Mức lương Net cạnh tranh (Lên tới $2000 tùy năng lực).\n- Tham gia làm việc tại một trong những công ty công nghệ Tech-hub hàng đầu VN.\n- Thưởng hiệu quả hoạt động 1-3 tháng lương tùy theo kết quả kinh doanh.\n- Bảo hiểm Y tế cao cấp PVI Care.\n- Khu thể thao tiện nghi 5 sao tích hợp sẵn trong khuôn viên làm việc.\n- Có không gian relax (Game, Cơm trưa, Coffee miễn phí mỗi sáng).',
        salary: '$1200 - $2000',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Python', 'SQL', 'Hadoop', 'Spark', 'Kafka']
      },
      {
        employerId: E.VIETTEL,
        title: 'DevOps Engineer (Kubernetes, CI/CD)',
        description: '- Thiết kế, xây dựng và quản trị hạ tầng Cloud (Viettel Cloud/AWS/GCP) cho các dự án quan trọng.\n- Chuẩn hóa, tối ưu và vận hành các quy trình CI/CD sử dụng GitLab CI, Jenkins.\n- Triển khai, giám sát hệ thống Container bằng Kubernetes (K8S) và Docker.\n- Sử dụng các công cụ Ansible, Terraform, Helm để tự động hóa hạ tầng (IaC).\n- Xây dựng hệ thống Monitoring & Alerting (Prometheus, Grafana, ELK Stack) đảm bảo sự ổn định của hệ thống 24/7.',
        requirements: '- Tốt nghiệp Đại học hệ chính quy loại Khá trở lên (Ưu tiên các trường Bách Khoa, Quốc Gia, Học viện KTQS).\n- Ít nhất 2-3 năm kinh nghiệm ở vị trí tương đương.\n- Chuyên môn vững về Linux (CentOS, Ubuntu), Networking cơ bản.\n- Kinh nghiệm cấu hình và quản trị hệ thống Cluster (Kubernetes/Docker Swarm).\n- Thông thạo ít nhất 1 ngôn ngữ kịch bản (Bash Shell, Python, Go).\n- Khả năng đọc hiểu tài liệu tiếng Anh kỹ thuật tốt.',
        benefits: '- Mức lương: Lên đến 35.000.000 VNĐ (Không giới hạn đối với ứng viên siêu xuất sắc).\n- Cơ chế đánh giá tăng lương chu kỳ 6 tháng/lần.\n- Phụ cấp ăn trưa tại Canteen tập đoàn, điện thoại, viễn thông hàng tháng miễn phí.\n- Được tiếp cận và vận hành các hệ thống Big Data, Cloud lớn bậc nhất Đông Nam Á.\n- Hưởng mức phúc lợi, chia sẻ cổ phần nội bộ đặc biệt từ Tập đoàn Quân Đội.\n- Du lịch nghỉ dưỡng hàng năm tại các Resort 5 sao cao cấp.',
        salary: '20,000,000 - 35,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Kubernetes', 'Docker', 'Linux', 'CI/CD', 'Ansible']
      },
      {
        employerId: E.TECHCOMBANK,
        title: 'Senior Middle Backend Developer (Java/Spring)',
        description: '- Đóng vai trò là Core Developer chịu trách nhiệm phát triển Backend Services cho hệ sinh thái Techcombank Mobile.\n- Thiết kế kiến trúc Microservices xử lý số lượng transactions cực cao (High Concurrency) với độ trễ thấp.\n- Triển khai, tích hợp các Open API, OAuth2 cho hệ thống thanh toán và Core Banking.\n- Phân tích và cải thiện performance (phân tích chỉ số RAM, CPU, GC tuning, DB query profiling).\n- Đảm bảo chất lượng sản phẩm thông qua Unit testing và quy trình Code Review theo tiêu chuẩn quốc tế.',
        requirements: '- 4-7 năm kinh nghiệm phát triển phần mềm bằng Java (với các framework như Spring Boot, Spring Cloud).\n- Am hiểu sâu sắc về kiến trúc Microservices, RESTful APIs, Event-Driven, gRPC.\n- Thành thạo các database Relational (Oracle, PostgreSQL) và NoSQL (MongoDB, Redis, Elasticsearch).\n- Có kiến thức tốt về hệ thống giao dịch đồng bộ, bất đồng bộ và RabbitMQ/Kafka.\n- Yêu thích viết clean code, unit tests, am hiểu về Design Pattern, SOLID principles.\n- Có tư duy tốt về bảo mật, OWASP.',
        benefits: '- Lương tháng 13 đảm bảo, cộng thêm phần Thưởng hiệu suất (tổng lên tới 16 tháng lương).\n- Gói Chăm sóc sức khỏe TCB-Care chuyên biệt 24/7 trị giá cao.\n- Quỹ vay mua nhà ở/mua ô tô với hạn mức rất lớn, ưu đãi lãi suất đặc biệt (chỉ từ 1.5% - 3%/năm cho nhân sự).\n- Tham gia vào môi trường Agile/Scrum cực chuẩn chỉnh, với văn hóa công ty mở (Open culture).\n- Laptop cấu hình cao làm việc, trang bị kèm màn hình DELL Ultrasharp 27 inch kép.',
        salary: '30,000,000 - 50,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Oracle', 'Kafka']
      },
      {
        employerId: E.SHOPEE,
        title: 'Business Analyst (E-Commerce Platform)',
        description: '- Khảo sát, thu thập và phân tích các yêu cầu nghiệp vụ E-commerce từ người dùng nội bộ (Marketing, Operation, Finance).\n- Biến các ý tưởng Business thành Document (BRD, FRS, UI/UX Wireframe) để truyền đạt cho Team Dev.\n- Phân tích luồng nghiệp vụ hiện tại để phát hiện các lỗ hổng hệ thống và đưa ra đề xuất cải tiến sản phẩm.\n- Cập nhật, quản lý Product Backlog; phối hợp chặt chẽ cùng Product Owner để sắp xếp ưu tiên (Prioritize) trên JIRA.\n- Kiểm soát và nghiệm thu phần mềm trong giai đoạn User Acceptance Test (UAT).',
        requirements: '- Tốt nghiệp Cử nhân các ngành Tài chính, Quản trị, Hệ thống thông tin hoặc tương đương.\n- Có ít nhất 3 năm kinh nghiệm Business Analyst trong các dự án về E-commerce/Logistics/Fintech.\n- Nắm vững kỹ năng viết tài liệu (Use Case, Sơ đồ quy trình BPMN, Wireframe sử dụng Axure/Balsamiq/Figma).\n- Khả năng giao tiếp, truyền đạt, đàm phán tốt, và làm MC cho các buổi trình bày tính năng.\n- Có chứng chỉ CSPO, CCBA hoặc tiếng Anh giao tiếp thành thạo là lợi thế để làm với Team Region (Regional team).',
        benefits: '- Chế độ lương bổng thuộc hàng TOP trong Mảng TMĐT (Shopee).\n- Xét duyệt tăng lương 2 lần/năm theo năng lực và khả năng deliver dự án.\n- Quyền mua cổ phiếu SEA Limited cực kỳ ưu đãi đối với các vị trí Senior.\n- Không gian làm việc chuẩn quốc tế ngay trung tâm Saigon.\n- Ăn nhẹ tại pantry, Free Grab đi lại, Voucher mua sắm hằng tháng trên sàn.\n- Môi trường tiếp xúc với quy trình chuẩn của Regional.',
        salary: '25,000,000 - 35,000,000 VND',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Business Analysis', 'BPMN', 'E-commerce', 'Figma', 'English']
      },
      {
        employerId: E.TIKI,
        title: 'QC Engineer / Tester (Manual/Automation)',
        description: '- Phụ trách kiểm thử chất lượng (Quality Assurance/Control) cho các tính năng trên Nền tảng Tiki (Web / App).\n- Phân tích yêu cầu, bóc tách Use case và thiết kế Test Plan, Test Case cẩn thận tỉ mỉ.\n- Thực hiện Test đa nền tảng: Functional Testing, Integration Testing, API Testing, Database Testing (SQL).\n- Log bug chính xác vào hệ thống Jira theo chu kỳ Sprint.\n- Áp dụng Automation Testing (Appium/Selenium) nếu có khả năng (công ty luôn tạo điều kiện học và phát triển).',
        requirements: '- Kinh nghiệm Test Web/App tối thiểu 1.5 năm.\n- Tư duy phản biện mạnh, attention-to-detail, và không bỏ sót bug (kể cả bug UI cực nhỏ).\n- Thành thạo công cụ API Testing (Postman/SoapUI) và Database truy vấn SQL cơ bản.\n- Hiểu biết về Agile/Scrum và vòng đời kiểm thử phần mềm (STLC).\n- Biết viết code tự động (Java/Python) sẽ mang lại mức khởi điểm vượt trội hơn hẳn.',
        benefits: '- Thu nhập: 12.000.000 - 18.000.000 VNĐ/tháng tủy mức độ senior.\n- Làm việc trong môi trường Product công nghệ hàng đầu, tập trung nhiều Master QA chuyên nghiệp để học hỏi.\n- Trợ cấp cơm trưa chuẩn Tiki.\n- Tham gia CLB thể thao của công ty (Yoga, Đá bóng, Chạy bộ).\n- Làm việc từ thứ 2 đến thứ 6 (Nghỉ thứ 7, CN). Cân đối work-life balance.',
        salary: '12,000,000 - 18,000,000 VND',
        location: 'Hồ Chí Minh',
        jobType: 'full-time',
        skills: ['Software Testing', 'Manual Test', 'API Testing', 'Postman', 'SQL']
      },
      {
        employerId: E.VNPT,
        title: 'Chuyên Viên Quản Trị Hệ Thống IT Helpdesk',
        description: '- Quản trị và duy trì các hệ thống mạng LAN, WAN, Wifi đảm bảo kết nối hoạt động liên tục tại trụ sở VNPT.\n- Hỗ trợ End-User (Cán bộ nhân viên) xử lý sự cố máy tính, máy in phần mềm, mail nội bộ.\n- Quản trị server Windows, hệ thống Active Directory, DHCP, DNS, File Server, máy tính ảo...\n- Nắm bắt quy trình vận hành và ghi nhận sự cố qua hệ thống Helpdesk ticketing.\n- Bảo trì và thay thế trang thiết bị công nghệ thông tin định kỳ.',
        requirements: '- Nam dưới 35 tuổi, có sức khoẻ tốt và sẵn sàng làm việc tăng ca nếu có sự cố hệ thống nghiêm trọng.\n- Có tối thiểu 1 năm làm IT Helpdesk, hỗ trợ kỹ thuật tại các công ty quy mô lớn hơn 500 thiết bị.\n- Kỹ năng xử lý phần cứng PC, Laptop, thiết bị văn phòng vượt trội.\n- Chứng chỉ Quản trị mạng MCSA hoặc CCNA là một ưu điểm.\n- Trung thực, cẩn thận, bảo mật tuyệt đối, tinh thần trách nhiệm tập thể, nhanh nhạy, chịu áp lực môi trường doanh nghiệp nhà nước.',
        benefits: '- Mức lương 10 - 14 Triệu đồng (Lương Net, công ty đóng thuế).\n- Phụ cấp tiền ăn ca, xăng xe, điện thoại, trách nhiệm.\n- Được kí hợp đồng dài hạn, hưởng mọi chế độ Công đoàn, Bảo hiểm xã hội Y tế theo hệ số nhà nước quy định.\n- Chăm lo du lịch hè, gói khám sức khoẻ tại các bệnh viện trung ương.\n- Quà cáp những dịp Lễ kỉ niệm đặc thù của đoàn thanh niên.\n- Có cấp quỹ riêng để đào tạo học thi các chứng chỉ Quốc Tế (Cisco, Microsoft).',
        salary: '10,000,000 - 14,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['IT Support', 'Network', 'Hardware', 'Windows Server', 'Troubleshooting']
      },
      {
        employerId: E.VINMEC,
        title: 'Chuyên Viên Vận Hành Công Nghệ Y Tế (Healthcare IT)',
        description: '- Đóng vai trò cầu nối chuyên môn Y Khoa và CNTT, vận hành hệ thống phần mềm HIS, LIS, RIS/PACS tại bệnh viện Vinmec.\n- Ghi nhận yêu cầu thay đổi từ Y, Bác sĩ và báo cáo lên Đội Phát Triển của VinGroup.\n- Đào tạo và hướng dẫn y tá, điều dưỡng, bác sĩ sử dụng các tính năng mới được cập nhật trên phần mềm.\n- Viết tài liệu quy trình vận hành, xử lí ngay các lỗi về tool trong ca trực bệnh viện.\n- Cập nhật liên tục các nghiệp vụ về bảo hiểm y tế, quy định nhà nước để tinh chỉnh mã lỗi phân hệ.',
        requirements: '- Trình độ Đại học các ngành Công nghệ, Tin học Y tế, Quản lý Bệnh Viện hoặc Kỹ thuật hệ thống.\n- Đã từng tham gia triển khai/vận hành HIS ít nhất 1 dự án (Hoặc từng support tool Bệnh viện).\n- Tỉ mỉ, cẩn thận tuyệt đối do tính chất Dữ liệu Sức khoẻ Cực kì nhạy cảm.\n- Giao tiếp mềm mỏng, tạo thiện cảm, nhẫn nại (Vì đặc thù bác sĩ rất bận rộn).\n- Khả năng xử lý khủng hoảng tốt, chịu khó, có thể chia ca trực luân phiên.',
        benefits: '- Cán bộ nguồn Y tế số với mức lương cam kết cao (15 - 20 Triệu).\n- Thẻ khám chữa bệnh Vinmec Platinum đặc quyền cho bản thân và giảm giá sốc cho gia đình.\n- Gói phúc lợi của Vingroup (VinFast, Vinhomes, VinSchool, VinPearl) vô cùng đa dạng.\n- Có nhà ăn 5 sao chuẩn chuyên gia dinh dưỡng cung cấp tại nơi làm.\n- Hoạt động Công đoàn luôn quan tâm tận tụy tới đời sống cán bộ nhân viên.\n- Quy trình lương thưởng sòng phẳng và tự hào vì hệ thống công nghệ bảo vệ con người.',
        salary: '15,000,000 - 20,000,000 VND',
        location: 'Hà Nội',
        jobType: 'full-time',
        skills: ['IT Helpdesk', 'HIS Workflow', 'Medical Support', 'Training', 'System Deployment']
      }
    ];

    const insertedJobs = await Job.insertMany(jobsData);
    console.log(`Created ${insertedJobs.length} detailed jobs.`);

    // ==========================================
    // 3. CREATE SOME SAMPLE APPLICATIONS
    // ==========================================
    const applications = await Application.create([
      {
        jobId: insertedJobs[0]._id, // Kids Plaza
        candidateId: candidates[0]._id, // Tran Thi A
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

    // ==========================================
    // 4. CREATE SOME SAMPLE INTERVIEWS
    // ==========================================
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
    console.log('🌟 SEED DATA COMPLETE (10 COMPANIES) 🌟');
    console.log('Run with `npm run dev` to see the beautiful TopCV-like data!');
    console.log('==================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
