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

    // Create users
    const employer = await User.create({
      email: 'employer@example.com',
      password: 'password123',
      role: 'employer',
      name: 'Nguyen Van A',
      phone: '0912345678',
    });

    const candidate1 = await User.create({
      email: 'candidate1@example.com',
      password: 'password123',
      role: 'candidate',
      name: 'Tran Thi B',
      phone: '0987654321',
    });

    const candidate2 = await User.create({
      email: 'candidate2@example.com',
      password: 'password123',
      role: 'candidate',
      name: 'Le Van C',
      phone: '0901234567',
    });

    console.log('Created users');

    // Create jobs
    const jobs = await Job.create([
      {
        employerId: employer._id,
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our team.',
        requirements: 'React, JavaScript, HTML/CSS, 2+ years experience',
        salary: '$1000 - $1500',
        location: 'Ho Chi Minh City',
        jobType: 'full-time',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
      },
      {
        employerId: employer._id,
        title: 'Backend Developer',
        description: 'Seeking an experienced Backend Developer for our API team.',
        requirements: 'Node.js, Express, MongoDB, 3+ years experience',
        salary: '$1200 - $1800',
        location: 'Ha Noi',
        jobType: 'full-time',
        skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
      },
      {
        employerId: employer._id,
        title: 'Full Stack Developer',
        description: 'Join our startup as a Full Stack Developer.',
        requirements: 'React, Node.js, MongoDB, Git',
        salary: '$1500 - $2000',
        location: 'Da Nang',
        jobType: 'full-time',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Git'],
      },
      {
        employerId: employer._id,
        title: 'UI/UX Designer',
        description: 'Design beautiful and functional user interfaces.',
        requirements: 'Figma, Adobe XD, Prototyping',
        salary: '$800 - $1200',
        location: 'Ho Chi Minh City',
        jobType: 'full-time',
        skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Design', 'Prototyping'],
      },
      {
        employerId: employer._id,
        title: 'DevOps Engineer',
        description: 'Manage our cloud infrastructure and CI/CD pipelines.',
        requirements: 'Docker, Kubernetes, AWS, CI/CD',
        salary: '$2000 - $2500',
        location: 'Remote',
        jobType: 'remote',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      },
    ]);
    console.log('Created 5 jobs');

    // Create applications
    const applications = await Application.create([
      {
        jobId: jobs[0]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
          experience: '2 years at ABC Company as Frontend Developer',
          education: 'Bachelor of Computer Science, XYZ University',
        },
        status: 'interview',
        appliedAt: new Date('2024-01-15'),
      },
      {
        jobId: jobs[0]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript'],
          experience: '1 year as Junior Frontend Developer',
          education: 'Bachelor of IT, DEF University',
        },
        status: 'pending',
        appliedAt: new Date('2024-01-18'),
      },
      {
        jobId: jobs[1]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
          experience: '3 years backend development',
          education: 'Master of Computer Science',
        },
        status: 'reviewed',
        appliedAt: new Date('2024-01-20'),
      },
      {
        jobId: jobs[2]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
          experience: 'Full Stack Developer for 2 years',
          education: 'Bachelor of Computer Science',
        },
        status: 'accepted',
        appliedAt: new Date('2024-01-10'),
      },
      {
        jobId: jobs[3]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['Figma', 'Adobe XD', 'UI Design', 'Sketch'],
          experience: '1 year as UI Designer',
          education: 'Bachelor of Design',
        },
        status: 'pending',
        appliedAt: new Date('2024-01-22'),
      },
      {
        jobId: jobs[4]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['Docker', 'Kubernetes', 'AWS', 'Linux'],
          experience: 'DevOps Engineer for 3 years',
          education: 'Bachelor of Network Engineering',
        },
        status: 'interview',
        appliedAt: new Date('2024-01-12'),
      },
      {
        jobId: jobs[4]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['React', 'JavaScript', 'CSS', 'HTML'],
          experience: 'Junior Frontend Developer',
          education: 'Self-taught',
        },
        status: 'rejected',
        appliedAt: new Date('2024-01-05'),
      },
      {
        jobId: jobs[1]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL'],
          experience: 'Backend Developer',
          education: 'Bachelor of IT',
        },
        status: 'pending',
        appliedAt: new Date('2024-01-25'),
      },
      {
        jobId: jobs[2]._id,
        candidateId: candidate1._id,
        parsedCV: {
          skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
          experience: 'Full Stack 4 years',
          education: 'Master degree',
        },
        status: 'reviewed',
        appliedAt: new Date('2024-01-08'),
      },
      {
        jobId: jobs[3]._id,
        candidateId: candidate2._id,
        parsedCV: {
          skills: ['Figma', 'UI Design', 'UX Design', 'Prototyping'],
          experience: '2 years UX Designer',
          education: 'Bachelor of Design',
        },
        status: 'accepted',
        appliedAt: new Date('2024-01-14'),
      },
    ]);
    console.log('Created 10 applications');

    // Create interviews
    await Interview.create([
      {
        applicationId: applications[0]._id,
        scheduledAt: new Date('2024-02-01T09:00:00'),
        location: '123 Nguyen Trai, District 1, HCMC',
        note: 'Technical interview with team lead',
        status: 'completed',
        result: 'passed',
      },
      {
        applicationId: applications[5]._id,
        scheduledAt: new Date('2024-02-05T14:00:00'),
        location: 'Online via Zoom',
        note: 'Final round interview',
        status: 'scheduled',
      },
      {
        applicationId: applications[3]._id,
        scheduledAt: new Date('2024-02-10T10:00:00'),
        location: '456 Le Duan, Da Nang',
        note: 'HR interview',
        status: 'completed',
        result: 'passed',
      },
    ]);
    console.log('Created 3 interviews');

    console.log('\nSeed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Employer: employer@example.com / password123');
    console.log('Candidate 1: candidate1@example.com / password123');
    console.log('Candidate 2: candidate2@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
