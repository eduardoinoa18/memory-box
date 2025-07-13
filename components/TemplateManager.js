/**
 * Template Management Interface
 * Step 8C: Create and manage email/SMS templates
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Mail, 
  MessageSquare, 
  Bell,
  Code,
  Wand2,
  FileText,
  Check,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  validateTemplate, 
  getTemplateVariables, 
  previewTemplate,
  defaultTemplates 
} from '../../lib/templateParser';

const TemplateManager = () => {
  const [templates, setTemplates] = useState({ email: [], sms: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('email');

  // Form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'notification',
    type: 'email',
    subject: '',
    body: '',
    html: '',
    variables: [],
    active: true
  });

  // Validation state
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    // Validate template when form changes
    if (templateForm.body || templateForm.html) {
      const content = templateForm.html || templateForm.body;
      const validationResult = validateTemplate(content);
      setValidation(validationResult);
    }
  }, [templateForm.body, templateForm.html]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Load email templates
      const emailQuery = query(
        collection(db, 'templates', 'email'),
        orderBy('name')
      );
      const emailSnapshot = await getDocs(emailQuery);
      const emailTemplates = emailSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'email',
        ...doc.data()
      }));

      // Load SMS templates
      const smsQuery = query(
        collection(db, 'templates', 'sms'),
        orderBy('name')
      );
      const smsSnapshot = await getDocs(smsQuery);
      const smsTemplates = smsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'sms',
        ...doc.data()
      }));

      setTemplates({
        email: emailTemplates,
        sms: smsTemplates
      });

    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!validation.isValid) {
        alert('Please fix template errors before saving');
        return;
      }

      const templateData = {
        ...templateForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        variables: validation.variables || []
      };

      await addDoc(collection(db, 'templates', templateForm.type), templateData);
      setShowCreateDialog(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (templateId, updates) => {
    try {
      await updateDoc(doc(db, 'templates', selectedTemplate.type, templateId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'templates', template.type, template.id));
        loadTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      delete duplicateData.id;

      await addDoc(collection(db, 'templates', template.type), duplicateData);
      loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    const preview = previewTemplate(template, template.category);
    setPreviewData(preview);
    setShowPreviewDialog(true);
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: 'notification',
      type: 'email',
      subject: '',
      body: '',
      html: '',
      variables: [],
      active: true
    });
    setValidation({ isValid: true, errors: [], warnings: [] });
  };

  const initializeDefaultTemplates = async () => {
    try {
      // Add default email templates
      for (const [key, template] of Object.entries(defaultTemplates.email)) {
        await addDoc(collection(db, 'templates', 'email'), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Add default SMS templates
      for (const [key, template] of Object.entries(defaultTemplates.sms)) {
        await addDoc(collection(db, 'templates', 'sms'), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      loadTemplates();
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
    }
  };

  const categories = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'campaign', label: 'Campaign' },
    { value: 'notification', label: 'Notification' },
    { value: 'security', label: 'Security' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Manager</h1>
          <p className="text-gray-600">Create and manage messaging templates</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {(templates.email.length === 0 && templates.sms.length === 0) && (
            <Button variant="outline" onClick={initializeDefaultTemplates}>
              <Wand2 className="w-4 h-4 mr-2" />
              Add Default Templates
            </Button>
          )}
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Design a reusable template for your messaging campaigns
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Welcome Email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Template Type</Label>
                    <Select 
                      value={templateForm.type} 
                      onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Template</SelectItem>
                        <SelectItem value="sms">SMS Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={templateForm.category} 
                      onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={templateForm.active}
                      onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, active: checked }))}
                    />
                    <Label>Active Template</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this template"
                    rows={2}
                  />
                </div>

                {/* Email-specific fields */}
                {templateForm.type === 'email' && (
                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Welcome to {{appName}}, {{firstName}}!"
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <Label htmlFor="body">
                    {templateForm.type === 'email' ? 'Text Content' : 'Message Content'}
                  </Label>
                  <Textarea
                    id="body"
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Hi {{firstName}}, welcome to {{appName}}!"
                    rows={4}
                  />
                </div>

                {/* HTML content for emails */}
                {templateForm.type === 'email' && (
                  <div>
                    <Label htmlFor="html">HTML Content (Optional)</Label>
                    <Textarea
                      id="html"
                      value={templateForm.html}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, html: e.target.value }))}
                      placeholder="<h1>Welcome {{firstName}}!</h1><p>Thanks for joining {{appName}}.</p>"
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* Variables Help */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    {Object.entries(getTemplateVariables(templateForm.category)).map(([key, description]) => (
                      <div key={key} className="flex">
                        <code className="font-mono bg-blue-100 px-1 rounded mr-2">
                          {`{{${key}}}`}
                        </code>
                        <span className="truncate">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Messages */}
                {!validation.isValid && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <h4 className="font-medium text-red-900">Template Errors</h4>
                    </div>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-900">Suggestions</h4>
                    </div>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTemplate} 
                  disabled={!templateForm.name || !validation.isValid}
                >
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Email Templates ({templates.email.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>SMS Templates ({templates.sms.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Email Templates */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.email.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{template.name}</span>
                        {!template.active && <Badge variant="secondary">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Subject:</p>
                      <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Preview:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.body?.substring(0, 100)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Switch
                        checked={template.active}
                        onCheckedChange={(checked) => 
                          handleUpdateTemplate(template.id, { active: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {templates.email.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No email templates</h3>
                <p className="text-gray-600 mb-4">Create your first email template to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Email Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SMS Templates */}
        <TabsContent value="sms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.sms.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{template.name}</span>
                        {!template.active && <Badge variant="secondary">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Message:</p>
                      <p className="text-sm text-gray-600">{template.body}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        Length: {template.body?.length || 0}/160 characters
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Switch
                        checked={template.active}
                        onCheckedChange={(checked) => 
                          handleUpdateTemplate(template.id, { active: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {templates.sms.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No SMS templates</h3>
                <p className="text-gray-600 mb-4">Create your first SMS template to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create SMS Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview with sample data
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              {previewData.subject && (
                <div>
                  <Label>Subject:</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {previewData.subject}
                  </div>
                </div>
              )}
              
              <div>
                <Label>Content:</Label>
                {previewData.html ? (
                  <div 
                    className="p-4 bg-white border rounded"
                    dangerouslySetInnerHTML={{ __html: previewData.html }}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                    {previewData.body}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Sample data used:</strong></p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  {JSON.stringify(previewData.sampleData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager;
