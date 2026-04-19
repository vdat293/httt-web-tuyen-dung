require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const companyLogos = [
  { name: 'California Fitness & Yoga', logo: 'https://jcb100wellness.com/wp-content/uploads/2025/12/1-3.png' },
  { name: 'Tập đoàn Sun Group', logo: 'https://duan-sungroup.com/wp-content/uploads/2020/02/logo-sungroup-2020.jpg' },
  { name: 'Lalamove Việt Nam', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb6P25XA4HrsIwWwcjhCiG1HbNbtbfqyv11A&s' },
  { name: 'Golden Gate Restaurant Group', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROc478zSyywcqZQdSsHiY6Et2Fl_n3xURlWQ&s' },
  { name: 'Công ty Cổ phần Be Group', logo: 'https://www.begroupholding.vn/wp-content/uploads/2022/06/logo-Be-Group.png' },
  { name: 'Công ty Cổ phần Vinhomes', logo: 'https://lockernlock.vn/wp-content/uploads/2023/09/Logo-cong-ty-co-phan-Vinhomes.jpg' },
  { name: 'FPT Software', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIssk-xHtpznKE4uSablwrY55M5mnKThYcBQ&s' },
  { name: 'Giao Hàng Tiết Kiệm (GHTK)', logo: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/dang_ky_giao_hang_tiet_kiem_thumb_629f7f41a9.jpg' },
  { name: "Biti's Việt Nam", logo: 'https://upload.wikimedia.org/wikipedia/vi/3/37/Bitis_logo.svg' },
  { name: 'CGV Cinemas Việt Nam', logo: 'https://yt3.googleusercontent.com/EsOy6vbf5_IS4JhUU8ocwYgxovm1b55CkXy2wjhRE1KMLIX-m5h189rJgX2opfZxHmIp5Ok3=s900-c-k-c0x00ffffff-no-rj' },
  { name: 'Tập đoàn Vingroup', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/9/98/Vingroup_logo.svg/1280px-Vingroup_logo.svg.png' },
  { name: 'Công ty Cổ phần VNG', logo: 'https://storage.googleapis.com/hust-files/images/vng_logoorange_19.5k.png' },
  { name: 'Công ty Cổ phần Tập đoàn Masan', logo: 'https://echeck.numbala.com/uploads/khachhang/cong-ty-co-phan-tap-doan-masan-1714471295-gix9w.jpg' },
  { name: 'KiotViet (Công ty Cổ phần Phần mềm Citigo)', logo: 'https://cdn1.vieclam24h.vn/upload/files_cua_nguoi_dung/logo/2016/07/19/logo-kiotviet-01.png' },
  { name: 'Highlands Coffee', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWfJUWKecfedJtsuTOPzmzy51L7szK8FDYfw&s' },
  { name: 'Vietnam Airlines', logo: 'https://spirit.vietnamairlines.com/wp-content/uploads/2025/04/1-12.jpg' },
  { name: 'Ngân hàng TMCP Ngoại Thương VN (Vietcombank)', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/9/9d/Vietcombank_Logo.svg/1280px-Vietcombank_Logo.svg.png' },
  { name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)', logo: 'https://cafef1.mediacdn.vn/LOGO/VIETTEL.png' },
  { name: 'Công ty Cổ phần Dịch vụ Di Động Trực tuyến (Momo)', logo: 'https://careerviet.vn/_next/image?url=https%3A%2F%2Fimages.careerviet.vn%2Femployer_folders%2Flot9%2F221789%2F95340imgpsh_fullsize.jpg&w=3840&q=75' },
];

const updateLogos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let updatedCount = 0;
    for (const item of companyLogos) {
      const result = await User.updateMany(
        { name: item.name, role: 'employer' },
        { $set: { companyLogo: item.logo } }
      );
      if (result.matchedCount > 0) {
        console.log(`Updated logo for: ${item.name}`);
        updatedCount += result.modifiedCount;
      } else {
        console.log(`Company not found: ${item.name}`);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} company logos.`);
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
};

updateLogos();
