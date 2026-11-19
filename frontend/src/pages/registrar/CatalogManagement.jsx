import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronDown, ChevronUp, Plus, Edit2, Save, X } from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = ['Core Courses', 'Mathematics', 'Electives', 'Humanities', 'Open Electives'];

export default function CatalogManagement() {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // expandedCatalogId → { requirements: [], loading, addFormOpen, addForm }
  const [expandedData, setExpandedData] = useState({});

  // editingReq: { catalogId, requirementId, minimumCredits, description }
  const [editingReq, setEditingReq] = useState(null);

  // New Catalog form state (at bottom)
  const [newCatalog, setNewCatalog] = useState({
    catalogYear: '2025',
    department: 'CSE',
    program: 'B.Tech CSE',
    totalCreditsRequired: 160,
    effectiveDate: '2025-08-01',
    catalogId: ''
  });
  const [creatingCatalog, setCreatingCatalog] = useState(false);
  const [catalogSuccessMessage, setCatalogSuccessMessage] = useState(null);
  const [catalogErrorMessage, setCatalogErrorMessage] = useState(null);

  const handleCreateCatalog = async (e) => {
    if (e) e.preventDefault();
    setCatalogErrorMessage(null);
    setCatalogSuccessMessage(null);

    if (!newCatalog.catalogYear || !newCatalog.department || !newCatalog.program) {
      setCatalogErrorMessage('Catalog Year, Department, and Program are required.');
      return;
    }

    try {
      setCreatingCatalog(true);
      const res = await api.post('/catalogs', {
        catalogYear: String(newCatalog.catalogYear).trim(),
        department: newCatalog.department.trim(),
        program: newCatalog.program.trim(),
        totalCreditsRequired: Number(newCatalog.totalCreditsRequired) || 160,
        effectiveDate: newCatalog.effectiveDate || `${newCatalog.catalogYear}-08-01`,
        catalogId: newCatalog.catalogId?.trim() || undefined
      });

      const created = res.data?.data || res.data;
      setCatalogSuccessMessage(`Catalog ${created.catalogId || ''} created successfully!`);

      // Reload catalogs list
      await loadCatalogs();

      // Reset form
      setNewCatalog(prev => ({
        ...prev,
        catalogId: ''
      }));

      setTimeout(() => setCatalogSuccessMessage(null), 5000);
    } catch (err) {
      setCatalogErrorMessage(err.response?.data?.message || 'Failed to create catalog');
    } finally {
      setCreatingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalogs');
      setCatalogs(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCatalog = async (catalog) => {
    const id = catalog.catalogId;
    if (expandedData[id]) {
      // collapse
      setExpandedData(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setExpandedData(prev => ({ ...prev, [id]: { requirements: [], loading: true, addFormOpen: false, addForm: { category: CATEGORIES[0], description: '', minimumCredits: '' } } }));
    try {
      const res = await api.get(`/catalogs/${id}/requirements`);
      const reqs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setExpandedData(prev => ({
        ...prev,
        [id]: { ...prev[id], requirements: reqs, loading: false }
      }));
    } catch (err) {
      setExpandedData(prev => ({
        ...prev,
        [id]: { ...prev[id], loading: false, error: err.response?.data?.message || 'Failed to load requirements' }
      }));
    }
  };

  const handleEditSave = async () => {
    if (!editingReq) return;
    const { catalogId, requirementId, minimumCredits, description } = editingReq;
    try {
      const res = await api.put(`/catalogs/${catalogId}/requirements/${requirementId}`, {
        minimumCredits: Number(minimumCredits),
        description,
      });
      const updated = res.data?.data || res.data;
      setExpandedData(prev => ({
        ...prev,
        [catalogId]: {
          ...prev[catalogId],
          requirements: prev[catalogId].requirements.map(r =>
            r.requirementId === requirementId ? { ...r, ...updated } : r
          )
        }
      }));
      setEditingReq(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update requirement');
    }
  };

  const handleAddReq = async (catalogId) => {
    const data = expandedData[catalogId];
    if (!data) return;
    const { addForm } = data;
    try {
      const res = await api.post(`/catalogs/${catalogId}/requirements`, {
        category: addForm.category,
        description: addForm.description,
        minimumCredits: Number(addForm.minimumCredits),
      });
      const newReq = res.data?.data || res.data;
      setExpandedData(prev => ({
        ...prev,
        [catalogId]: {
          ...prev[catalogId],
          requirements: [...prev[catalogId].requirements, newReq],
          addFormOpen: false,
          addForm: { category: CATEGORIES[0], description: '', minimumCredits: '' }
        }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add requirement');
    }
  };

  const updateAddForm = (catalogId, field, value) => {
    setExpandedData(prev => ({
      ...prev,
      [catalogId]: {
        ...prev[catalogId],
        addForm: { ...prev[catalogId].addForm, [field]: value }
      }
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading catalogs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
          <p className="text-gray-600 mt-1">View and manage degree catalogs and their requirements</p>
        </div>

        {/* Catalogs Table */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg">Degree Catalogs</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{catalogs.length} catalog(s) found</p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="bg-gray-800 px-4 py-3 grid grid-cols-5 gap-4 text-xs font-medium text-white uppercase">
              <div>Catalog ID</div>
              <div>Program</div>
              <div>Department</div>
              <div>Year</div>
              <div>Total Credits Required</div>
            </div>

            {catalogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No catalogs found.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {catalogs.map((catalog) => {
                  const id = catalog.catalogId;
                  const isExpanded = !!expandedData[id];
                  const expData = expandedData[id];

                  return (
                    <div key={id}>
                      {/* Catalog Row */}
                      <div
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleToggleCatalog(catalog)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                            <div className="font-mono text-sm text-gray-900">{catalog.catalogId}</div>
                            <div className="text-sm text-gray-900">{catalog.program}</div>
                            <div className="text-sm text-gray-900">{catalog.department}</div>
                            <div className="text-sm text-gray-900">{catalog.catalogYear || catalog.year}</div>
                            <div className="text-sm font-semibold text-gray-900">{catalog.totalCreditsRequired}</div>
                          </div>
                          <div className="ml-4 text-gray-400">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Requirements */}
                      {isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-4">
                          {expData.loading && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm">Loading requirements...</span>
                            </div>
                          )}

                          {expData.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">{expData.error}</div>
                          )}

                          {!expData.loading && !expData.error && (
                            <>
                              {/* Requirements sub-table */}
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
                                  <h3 className="text-sm font-bold text-white uppercase">Requirements</h3>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedData(prev => ({
                                        ...prev,
                                        [id]: { ...prev[id], addFormOpen: !prev[id].addFormOpen }
                                      }));
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center space-x-1"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Add Requirement</span>
                                  </Button>
                                </div>

                                {/* Add Requirement Form */}
                                {expData.addFormOpen && (
                                  <div className="bg-blue-50 border-b border-blue-200 p-4" onClick={e => e.stopPropagation()}>
                                    <h4 className="text-sm font-semibold text-blue-900 mb-3">New Requirement</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          value={expData.addForm.category}
                                          onChange={e => updateAddForm(id, 'category', e.target.value)}
                                        >
                                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                          type="text"
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Description"
                                          value={expData.addForm.description}
                                          onChange={e => updateAddForm(id, 'description', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Credits</label>
                                        <input
                                          type="number"
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Credits"
                                          value={expData.addForm.minimumCredits}
                                          onChange={e => updateAddForm(id, 'minimumCredits', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddReq(id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                      >
                                        Save Requirement
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setExpandedData(prev => ({ ...prev, [id]: { ...prev[id], addFormOpen: false } }))}
                                        className="text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {expData.requirements.length === 0 ? (
                                  <div className="text-center py-8 text-sm text-gray-500">No requirements found for this catalog.</div>
                                ) : (
                                  <>
                                    {/* Sub-table header */}
                                    <div className="bg-gray-600 grid grid-cols-5 gap-2 px-4 py-2 text-xs font-medium text-white uppercase">
                                      <div>Category</div>
                                      <div className="col-span-2">Description</div>
                                      <div>Min Credits</div>
                                      <div>Actions</div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                      {expData.requirements.map((req, idx) => {
                                        const isEditing = editingReq?.requirementId === req.requirementId && editingReq?.catalogId === id;
                                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                        return (
                                          <div key={req.requirementId} className={rowBg} onClick={e => e.stopPropagation()}>
                                            {isEditing ? (
                                              <div className="p-4 space-y-2">
                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                                    <input
                                                      type="text"
                                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      value={editingReq.description}
                                                      onChange={e => setEditingReq(prev => ({ ...prev, description: e.target.value }))}
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Credits</label>
                                                    <input
                                                      type="number"
                                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      value={editingReq.minimumCredits}
                                                      onChange={e => setEditingReq(prev => ({ ...prev, minimumCredits: e.target.value }))}
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                  <Button size="sm" onClick={handleEditSave} className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center space-x-1">
                                                    <Save className="h-3 w-3" />
                                                    <span>Save</span>
                                                  </Button>
                                                  <Button size="sm" variant="outline" onClick={() => setEditingReq(null)} className="text-xs flex items-center space-x-1">
                                                    <X className="h-3 w-3" />
                                                    <span>Cancel</span>
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-5 gap-2 px-4 py-3 items-start text-sm">
                                                <div>
                                                  <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                    {req.category}
                                                  </span>
                                                </div>
                                                <div className="col-span-2 text-gray-700">
                                                  <p>{req.description}</p>
                                                  {req.courseList && req.courseList.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                                      {Array.isArray(req.courseList) ? req.courseList.join(', ') : req.courseList}
                                                    </p>
                                                  )}
                                                </div>
                                                <div className="font-semibold text-gray-900">{req.minimumCredits}</div>
                                                <div>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingReq({
                                                      catalogId: id,
                                                      requirementId: req.requirementId,
                                                      minimumCredits: req.minimumCredits,
                                                      description: req.description,
                                                    })}
                                                    className="text-xs flex items-center space-x-1"
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                    <span>Edit</span>
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Catalog Section (At bottom) */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Add New Degree Catalog</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Create a new curriculum catalog for an academic year and department
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateCatalog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={newCatalog.department}
                    onChange={(e) => {
                      const dept = e.target.value;
                      setNewCatalog(prev => ({
                        ...prev,
                        department: dept,
                        program: `B.Tech ${dept}`
                      }));
                    }}
                  >
                    <option value="CSE">CSE</option>
                    <option value="CCE">CCE</option>
                    <option value="ECE">ECE</option>
                    <option value="MME">MME</option>
                    <option value="HSS">HSS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Catalog Year
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2025"
                    value={newCatalog.catalogYear}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, catalogYear: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Program
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. B.Tech CSE"
                    value={newCatalog.program}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, program: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Total Credits
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="160"
                    value={newCatalog.totalCreditsRequired}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, totalCreditsRequired: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Catalog ID (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`CAT-${newCatalog.catalogYear || 'YYYY'}-${newCatalog.department || 'DEPT'}`}
                    value={newCatalog.catalogId}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, catalogId: e.target.value }))}
                  />
                </div>
              </div>

              {catalogSuccessMessage && (
                <div className="bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-2.5 rounded">
                  {catalogSuccessMessage}
                </div>
              )}

              {catalogErrorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-800 text-sm px-4 py-2.5 rounded">
                  {catalogErrorMessage}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={creatingCatalog || !newCatalog.catalogYear || !newCatalog.department || !newCatalog.program}
                  className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-2 text-sm px-5 py-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{creatingCatalog ? 'Creating Catalog...' : 'Add Catalog'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
