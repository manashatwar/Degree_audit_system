import React, { useState } from 'react';
import { registrarService } from '../../services/registrarService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function RegistrarImport() {
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'complete'

  // Helper function to get grade point for badge color
  const getGradePoint = (grade) => {
    if (typeof grade === 'number') return grade;
    const gradeMap = {
      'A': 10, 'AB': 9, 'B': 8, 'BC': 7,
      'C': 6, 'CD': 5, 'D': 4, 'F': 0
    };
    return gradeMap[String(grade).toUpperCase()] || 0;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setValidationResult(null);
      setImportSummary(null);
      setStep('upload');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setValidationResult(null);
      setImportSummary(null);
      setStep('upload');
    } else {
      alert('Please drop a CSV file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const records = results.data.map(row => {
            let grade = row.grade || row.Grade || '';

            // Check if grade is a letter grade or numeric
            const numericGrade = parseFloat(grade);
            if (!isNaN(numericGrade)) {
              grade = numericGrade;
            } else {
              // Keep as string (letter grade)
              grade = String(grade).toUpperCase().trim();
            }

            return {
              studentId: row.studentId || row.StudentID || row.student_id || '',
              courseCode: row.courseCode || row.CourseCode || row.course_code || '',
              semester: row.semester || row.Semester || '',
              grade: grade,
              credits: parseInt(row.credits || row.Credits) || 0
            };
          });
          resolve(records);
        },
        error: (error) => reject(error)
      });
    });
  };

  const handleValidate = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const records = await parseCSV(file);

      if (records.length === 0) {
        alert('CSV file is empty or has no valid data');
        setLoading(false);
        return;
      }

      const result = await registrarService.previewImport(records);
      setValidationResult(result);
      setStep('preview');
    } catch (err) {
      console.error('Validation error:', err);
      alert(err.response?.data?.message || 'Failed to validate file. Please check the CSV format.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult) return;

    try {
      setLoading(true);

      console.log('Valid records before mapping:', validationResult.validRecords);

      // Extract just the record objects from the validation result
      const validRecords = validationResult.validRecords
        .filter(vr => vr && vr.record) // Filter out any undefined/null records
        .map(vr => vr.record);

      console.log('Mapped valid records:', validRecords);

      if (validRecords.length === 0) {
        alert('No valid records to import');
        setLoading(false);
        return;
      }

      const summary = await registrarService.confirmImport(validRecords);
      setImportSummary(summary);
      setStep('complete');
    } catch (err) {
      console.error('Import error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to import transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportSummary(null);
    setStep('upload');
  };

  const downloadSampleCSV = () => {
    const sample = `studentId,courseCode,semester,grade,credits
24UCS101,CS101,2024-2025 I,AB,4
24UCS101,MA101,2024-2025 I,B,4
24UCS102,CS101,2024-2025 I,BC,4
24UCS102,PH101,2024-2025 I,C,4
23UCS048,CS301,2024-2025 I,A,4`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transcript.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Student Transcripts</h1>
          <p className="text-gray-600 mt-1">Upload and validate transcript data from CSV files</p>
        </div>

        {step === 'upload' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload Transcript File</CardTitle>
                <CardDescription>
                  Select a CSV file containing student transcript records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {file ? file.name : 'Click to select a CSV file'}
                    </p>
                    <p className="text-sm text-gray-600">
                      or drag and drop your file here
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleValidate} disabled={loading}>
                      {loading ? 'Validating...' : 'Validate & Preview'}
                    </Button>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Required CSV Columns:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <span className="font-mono text-xs bg-gray-200 px-1 rounded">studentId</span> - Student identification number</li>
                    <li>• <span className="font-mono text-xs bg-gray-200 px-1 rounded">courseCode</span> - Course code (e.g., CS301)</li>
                    <li>• <span className="font-mono text-xs bg-gray-200 px-1 rounded">semester</span> - Semester name (e.g., 2024-2025 I)</li>
                    <li>• <span className="font-mono text-xs bg-gray-200 px-1 rounded">grade</span> - Letter grade (A, AB, B, BC, C, CD, D, F)</li>
                    <li>• <span className="font-mono text-xs bg-gray-200 px-1 rounded">credits</span> - Credit hours (positive integer)</li>
                  </ul>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={downloadSampleCSV}
                    className="mt-2 p-0 h-auto text-blue-600"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'preview' && validationResult && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{validationResult.totalRecords}</p>
                    </div>
                    <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valid Records</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{validationResult.validCount}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Invalid Records</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{validationResult.invalidCount}</p>
                    </div>
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {validationResult.invalidCount > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Validation Errors</span>
                  </CardTitle>
                  <CardDescription>
                    {validationResult.invalidCount} records contain errors and will not be imported
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResult.invalidRecords.slice(0, 10).map((invalid, idx) => (
                          <TableRow key={invalid.rowNumber || idx}>
                            <TableCell>{invalid.rowNumber}</TableCell>
                            <TableCell>{invalid.record?.studentId || 'N/A'}</TableCell>
                            <TableCell>{invalid.record?.courseCode || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {invalid.errors?.map((error, index) => (
                                  <p key={index} className="text-sm text-red-600">{error}</p>
                                )) || <p className="text-sm text-red-600">Unknown error</p>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {validationResult.invalidCount > 10 && (
                    <p className="text-sm text-gray-600 mt-4">
                      Showing 10 of {validationResult.invalidCount} errors
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {validationResult.validCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Valid Records Preview</CardTitle>
                  <CardDescription>
                    {validationResult.validCount} records ready to import
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Credits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResult.validRecords.slice(0, 10).map((valid, idx) => (
                          <TableRow key={valid.rowNumber || idx}>
                            <TableCell>{valid.rowNumber}</TableCell>
                            <TableCell className="font-medium">{valid.record?.studentId || 'N/A'}</TableCell>
                            <TableCell>{valid.record?.courseCode || 'N/A'}</TableCell>
                            <TableCell>{valid.record?.semester || 'N/A'}</TableCell>
                            <TableCell>
                              {valid.record?.grade ? (
                                <Badge variant={getGradePoint(valid.record.grade) >= 8 ? 'success' : getGradePoint(valid.record.grade) >= 6 ? 'outline' : 'destructive'}>
                                  {String(valid.record.grade).toUpperCase()}
                                </Badge>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{valid.record?.credits || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {validationResult.validCount > 10 && (
                    <p className="text-sm text-gray-600 mt-4">
                      Showing 10 of {validationResult.validCount} valid records
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={loading || validationResult.validCount === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Importing...' : `Import ${validationResult.validCount} Records`}
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && importSummary && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6" />
                <span>Import Completed Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Records Imported</p>
                  <p className="text-4xl font-bold text-green-600">{importSummary.recordsImported}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Students Affected</p>
                  <p className="text-4xl font-bold text-blue-600">{importSummary.affectedStudents}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Degree audits have been automatically recalculated for all affected students.
                </p>
              </div>

              <Button onClick={handleReset} className="w-full">
                Import Another File
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
