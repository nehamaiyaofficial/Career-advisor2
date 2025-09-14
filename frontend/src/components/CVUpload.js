import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { parseCV } from '../services/api';

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function CVUpload({ onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [progress, setProgress] = useState(0);

  // Parse PDF client-side
  const parsePDF = async (file) => {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        
        try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let textContent = '';
          
          // Get total pages for progress tracking
          const totalPages = pdf.numPages;
          
          for (let i = 1; i <= totalPages; i++) {
            // Update progress
            setProgress(Math.round((i / totalPages) * 100));
            
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => item.str).join(' ') + '\n';
          }
          
          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      };
      
      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Reset error state
    setError(null);
    
    // Validate file type
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      setError('Please enter your skills or CV text');
      return;
    }
    
    setIsParsing(true);
    setError(null);
    
    try {
      const extractedSkills = await parseCV(manualInput);
      setSkills(extractedSkills);
      onSkillsExtracted(extractedSkills);
    } catch (err) {
      setError('Failed to parse skills from manual input. Please try again.');
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    setIsParsing(true);
    setError(null);
    setProgress(0);
    
    try {
      // Parse PDF client-side
      const pdfText = await parsePDF(file);
      
      // Send extracted text to backend for skill analysis
      const extractedSkills = await parseCV(pdfText);
      setSkills(extractedSkills);
      onSkillsExtracted(extractedSkills);
    } catch (err) {
      setError('Failed to parse PDF. Please try again or use manual input.');
      console.error(err);
    } finally {
      setIsParsing(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSkills([]);
    setManualInput('');
    setError(null);
    setProgress(0);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Your CV</h2>
        {(file || manualInput) && (
          <button 
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Reset
          </button>
        )}
      </div>
      
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload CV
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Input
        </button>
      </div>
      
      {activeTab === 'upload' ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-gray-600 mb-2">Drag & drop your CV here</p>
              <p className="text-gray-500 text-sm mb-4">PDF format only, max 5MB</p>
              <label className="btn-secondary cursor-pointer">
                Browse Files
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {file && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          
          {isParsing && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">Parsing CV... {progress}%</p>
            </div>
          )}
          
          <button 
            onClick={handleFileSubmit} 
            className="btn-primary w-full"
            disabled={isParsing || !file}
          >
            {isParsing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Parsing CV...
              </span>
            ) : 'Parse CV'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea 
            value={manualInput} 
            onChange={(e) => setManualInput(e.target.value)} 
            placeholder="Paste your CV text or list your skills here..."
            className="input-field h-32"
          />
          <button 
            onClick={handleManualSubmit} 
            className="btn-primary w-full"
            disabled={isParsing || !manualInput.trim()}
          >
            {isParsing ? 'Parsing...' : 'Submit Skills'}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {skills.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Extracted Skills:</h3>
            <span className="text-sm text-gray-500">{skills.length} skills found</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">Tips for better results:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start">
            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Ensure your CV clearly lists technical skills
          </li>
          <li className="flex items-start">
            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Use a standard format with clear section headings
          </li>
          <li className="flex items-start">
            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Include both technical and soft skills for comprehensive analysis
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CVUpload;
