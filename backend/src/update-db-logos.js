require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const companyLogos = [
  { name: 'California Fitness & Yoga', logo: 'https://cdn1.vieclam24h.vn/images/employer_avatar/2024/08/23/CFYC_Logo_172440818769.png' },
  { name: 'Tập đoàn Sun Group', logo: 'https://duan-sungroup.com/wp-content/uploads/2020/02/logo-sungroup-2020.jpg' },
  { name: 'Lalamove Việt Nam', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAtFBMVEX/////Zx3/pAD//fz/zLT/eTj/sSX/f0D/vZ7/nm//5LL/9eL/bCX/hEj/lGD/uJb/s47/w6X/q4L/+e7/6+H/1cD/7s//rRj/+PX/djP/ci7/0br/yK3/pHj/rYb/8df/4tT/znb/u0D/jVX/8uz/5dj/3Mz/j1j/h0z/mGf/vkn/3aD/uDf/xFn/1ov/2pb/ymr/5rn/5LT/rI7/oXP/kWr/36b/d0f/0Hr/XCL/zF3/03TGylMLAAAEA0lEQVR4nO3Ya3fiNhAGYEnGV0wAc7ED2NwNAUJI2mbT9v//r87INvHmcHZ7Uny8pO/zIbYFZzOjkTTeCAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8L+zStZ1h3AVjftu3SFcg+HKRt0xXMPAl7O6Y/j3JquLw6t1+iD9y5/9mhK5bBgfxvqB7UspW1EtEX1WeyQ/5NKQ2l1tIX3WuLukXCbF/PezPOTHOv3yjHbcSJ2tlJusLp1bLYiIkruHpJF2OZexIdpZIoO6w/qMvuPEbjBJJ6Y0E1fnMfrv/2pz2vs4VPVyXW/cboNy6eTVIAmPd0z7/eR6MO0lBzKzzcl5cGLbtq7dzrKsJ7oe6bqga29uKaUWzxT8Qg8IsbfC6bOVOVSUSdR23dhpOIFZJNLn4VZpyw+KUUeW+j0f0x2Om6JWjxQ1Xy0hhqHK7IWg2yZ/l56Mx3w4rCgRmudJN6Bc0m2Wx5bHjFFpy+sUx3QTS3lulLqCLt0854m88vWk8zr2DE9xDielhvSVJ6U8YanQe/E8b1pZIgP7bpBOgvg+S0TPOR3EQfE5NZfAl226W0qzGIx86W5kK4tSqZ0QB74+CZr4I3/hTak3cVTqVXBhQi7YqbIUchT1KBin9GZy3upjKc8vv/dUHF9P/khuisGEll4gfdpHJ2Ut1EE0aVsoNRXF2hlymZ51VnsuCD3Pm6zKTKIlZ9Dp8LLPdjMtnDT/sMvryebJL5UpkjLmtjMTYqF2R9obc/VI8y+mxcTrRJr6KeSt85pvkUWViQhxPrMesmc6iItDi3bLLB7x5JfKFMvROGnpdRiquacsI1QvVBuOV68svpnzhztB2+VZLzVtXm0ia/l9U29JO79zpO/oj9alMq2oIFxF+RtP+n6qDkcVGhZFvS8S2enwedFZ6pA9N3uk2jxEfmKdV45PK6e426x/T7Y8+e65V1LBZu2Afv4hXijgZrbPebppRelGMcz2ykkdXrOTi7Os3kynYQ9KzxuHJFHeOqiVtKlMIx5sp1FeOl9+40OrqVsJx77ngNVbdvpSQbIjTXdJbpFepacv4/PK77w/O8WWoSWnT9yUQjeKwbGbd817+afxF6XQ09FmTWNa6od5k+HYvXw0X3gVWfEu75cGHNNmZjoYZWWKWma8srPBODLNbOEF5rfe3+FOGAfLGop5eOAd0DxRKuFpqL/Ro3cSfYp5+QuKNawykaTU/r53+VXvJy+ARrXN4ge/2H9vdDetK/2b+z/hRebX+BsWHa3bukO4jpbs//xLN6BfNPFbt5R1R3Ad/S+y08XyBv+KdcmqXXcEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfwT+qnTnSkFO9fQAAAABJRU5ErkJggg==' },
  { name: 'Golden Gate Restaurant Group', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROc478zSyywcqZQdSsHiY6Et2Fl_n3xURlWQ&s' },
  { name: 'Công ty Cổ phần Be Group', logo: 'https://www.begroupholding.vn/wp-content/uploads/2022/06/logo-Be-Group.png' },
  { name: 'Công ty Cổ phần Vinhomes', logo: 'https://lockernlock.vn/wp-content/uploads/2023/09/Logo-cong-ty-co-phan-Vinhomes.jpg' },
  { name: 'FPT Software', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIssk-xHtpznKE4uSablwrY55M5mnKThYcBQ&s' },
  { name: 'Giao Hàng Tiết Kiệm (GHTK)', logo: 'https://hrchannels.com/Upload/avatar/20230325/144310892_Logo.png' },
  { name: "Biti's Việt Nam", logo: 'https://upload.wikimedia.org/wikipedia/vi/3/37/Bitis_logo.svg' },
  { name: 'CGV Cinemas Việt Nam', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/CGV_Cinemas.svg' },
  { name: 'Tập đoàn Vingroup', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/9/98/Vingroup_logo.svg/1280px-Vingroup_logo.svg.png' },
  { name: 'Công ty Cổ phần VNG', logo: 'https://storage.googleapis.com/hust-files/images/vng_logoorange_19.5k.png' },
  { name: 'Công ty Cổ phần Tập đoàn Masan', logo: 'https://echeck.numbala.com/uploads/khachhang/cong-ty-co-phan-tap-doan-masan-1714471295-gix9w.jpg' },
  { name: 'KiotViet (Công ty Cổ phần Phần mềm Citigo)', logo: 'https://cdn1.vieclam24h.vn/upload/files_cua_nguoi_dung/logo/2016/07/19/logo-kiotviet-01.png' },
  { name: 'Highlands Coffee', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWfJUWKecfedJtsuTOPzmzy51L7szK8FDYfw&s' },
  { name: 'Vietnam Airlines', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Pr5d6ccwsiBLzRCDv8MoRsUllArfWhdJ_4kqFJ0bHqwqq4JufmOGWvulVmypiVkFlT68TqCUkEWVacHvu0P9Q5XVhCRoTIk&s&ec=121644734' },
  { name: 'Ngân hàng TMCP Ngoại Thương VN (Vietcombank)', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/9/9d/Vietcombank_Logo.svg/1280px-Vietcombank_Logo.svg.png' },
  { name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)', logo: 'https://cafef1.mediacdn.vn/LOGO/VIETTEL.png' },
  { name: 'Công ty Cổ phần Dịch vụ Di Động Trực tuyến (Momo)', logo: 'https://careerviet.vn/_next/image?url=https%3A%2F%2Fimages.careerviet.vn%2Femployer_folders%2Flot9%2F221789%2F95340imgpsh_fullsize.jpg&w=3840&q=75' },
  { name: 'H&M Việt Nam', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
  { name: 'Công ty Cổ phần Kids Plaza', logo: 'https://www.kidsplaza.vn/blog/wp-content/uploads/2016/02/viber-image-2019-05-16-08.59.35.jpg' },
  { name: 'Uniqlo Việt Nam', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStW_pjJEzmmxSmqP1r5le-exJZ_e36cG2WVA&s' },
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
