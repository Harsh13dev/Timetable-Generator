// Fixed FeaturesSection.jsx
import { Clock, Shield, School, FileText, Edit3, Download, Zap, Target, Database } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Time-Saving Automation",
    description: "Saves hours of manual scheduling with intelligent algorithms",
    backDescription: "Our advanced algorithms analyze hundreds of scheduling possibilities in seconds, automatically generating optimal timetables that would take hours to create manually.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Conflict Prevention",
    description: "Prevents teacher/class conflicts with smart validation",
    backDescription: "Real-time conflict detection ensures no teacher is scheduled for multiple classes simultaneously and all classroom resources are properly allocated.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: School,
    title: "Universal Compatibility",
    description: "Works for any school, college, or educational institution",
    backDescription: "Flexible system that adapts to any educational structure - from elementary schools to universities, with support for various academic calendars and scheduling formats.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: FileText,
    title: "Export Options",
    description: "Export timetables as PDF or Excel with one click",
    backDescription: "Professional-quality exports with customizable templates, formatting options, and the ability to generate separate schedules for teachers, students, and administrators.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Edit3,
    title: "Dynamic Editing",
    description: "Real-time editing with instant conflict detection",
    backDescription: "Make changes on the fly with immediate feedback. Our system instantly validates modifications and suggests alternatives for any scheduling conflicts.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Support for various export formats and templates",
    backDescription: "Choose from multiple professional templates and export formats including PDF, Excel, CSV, and printable versions optimized for different paper sizes.",
    gradient: "from-teal-500 to-blue-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate complex timetables in seconds",
    backDescription: "Optimized algorithms process complex scheduling requirements instantly, handling hundreds of classes, teachers, and constraints without any delays.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Target,
    title: "Precision Scheduling",
    description: "Optimized resource allocation and time management",
    backDescription: "Maximize resource utilization while minimizing gaps and conflicts. Our system ensures optimal distribution of workload across all teaching staff and facilities.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: Database,
    title: "Secure Data Storage",
    description: "Cloud-based storage with automatic backup and sync",
    backDescription: "Your timetables are securely stored in the cloud with automatic backups, version history, and seamless synchronization across all devices. Access your data anytime, anywhere.",
    gradient: "from-violet-500 to-purple-500"
  }
];

function FeaturesSection() {
  return (
    <div className="features-section">
      <div className="features-header">
        <h2 className="features-title">Powerful Features</h2>
        <p className="features-subtitle">Everything you need to create perfect timetables</p>
      </div>
      <div className="features-circle">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="feature-card"
              style={{
                '--animation-delay': `${index * 0.1}s`
              }}
            >
              <div className="feature-card-inner">
                <div className="feature-card-front">
                  <div className={`feature-icon bg-gradient-to-br ${feature.gradient}`}>
                    <Icon size={32} className="icon-main" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <div className="feature-card-back">
                  <div className={`feature-icon-large bg-gradient-to-br ${feature.gradient}`}>
                    <Icon size={32} className="icon-large" />
                  </div>
                  <div className="feature-details">
                    <h4 className="feature-back-title">{feature.title}</h4>
                    <p className="feature-back-description">{feature.backDescription}</p>
                    {/* <div className="feature-shine"></div> */}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FeaturesSection;