import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ skills, suggestions, trendingSkills }) {
  // Data for skills chart
  const skillsData = {
    labels: skills,
    datasets: [
      {
        label: 'Proficiency Level',
        data: skills.map(() => Math.floor(Math.random() * 100)), // Random data for demo
        backgroundColor: '#4F46E5',
        borderRadius: 6,
      },
    ],
  };

  // Data for missing skills chart
  const missingSkillsData = {
    labels: suggestions.missingSkills,
    datasets: [
      {
        label: 'Importance',
        data: suggestions.missingSkills.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Your Skills</h3>
          <div className="h-64">
            <Bar data={skillsData} options={options} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Skills to Develop</h3>
          <div className="h-64">
            <Bar data={missingSkillsData} options={options} />
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Recommended Courses</h3>
        <div className="space-y-3">
          {suggestions.recommendedCourses.map((course, i) => (
            <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white mr-3">
                {i + 1}
              </div>
              <div>
                <h4 className="font-medium">{course.name}</h4>
                <p className="text-sm text-gray-600">{course.platform}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Career Roadmap</h3>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6 ml-6">
            {suggestions.careerRoadmap.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-7 w-5 h-5 rounded-full bg-primary border-4 border-white"></div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium">{step}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
