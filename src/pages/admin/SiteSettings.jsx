import { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, Grid, Paper, Tab, Tabs, Typography, Alert, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../config/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AnimatePresence, motion } from 'framer-motion';
import TabTransition from '../../components/TabTransition';
import BrowserNotificationManager from '../../components/BrowserNotificationManager';

const SiteSettings = () => {
  const theme = useTheme();
  const quillRef = useRef(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [editingSlug, setEditingSlug] = useState(null); // Track which page is being edited
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    openingHours: ''
  });
  const [staticPages, setStaticPages] = useState({
    about: { title: 'Giới thiệu', content: '' },
    contact: { title: 'Liên hệ', content: '' },
    payment: { title: 'Hình thức thanh toán', content: '' },
    warranty: { title: 'Chính sách bảo hành', content: '' },
    shipping: { title: 'Chính sách vận chuyển', content: '' },
    privacy: { title: 'Chính sách bảo mật', content: '' },
    terms: { title: 'Điều khoản dịch vụ', content: '' },
    partners: { title: 'Đối tác', content: '' },
    owner: { title: 'Thông tin chủ sở hữu', content: '' },
    license: { title: 'Giấy phép kinh doanh', content: '' }
  });
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });
  const [loading, setLoading] = useState(false);

  // Cấu hình cho React-Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'link', 'image'
  ];

  // Xử lý upload ảnh trong Quill
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.url; // URL của ảnh đã upload
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert('error', 'Không thể tải lên hình ảnh');
      return null;
    }
  };

  useEffect(() => {
    loadSettings();
    loadStaticPages();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response?.data?.success) {
        console.log('Loaded settings:', response.data.data);
        setFormData({
          businessName: response.data.data.company_name || '',
          address: response.data.data.address || '',
          phone: response.data.data.phone || '',
          email: response.data.data.email || '',
          description: response.data.data.description || '',
          openingHours: response.data.data.opening_hours || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert('error', 'Không thể tải thông tin cài đặt');
    }
  };

  const loadStaticPages = async () => {
    try {
      const pages = { ...staticPages };
      for (const slug in pages) {
        try {
          const response = await axios.get(`/api/static-pages/${slug}`);
          console.log(`Loaded ${slug} page:`, response.data);
          if (response?.data) { // Remove .success check since GET doesn't have it
            pages[slug] = {
              ...pages[slug],
              content: response.data.content || '',
              title: response.data.title || pages[slug].title
            };
          }
        } catch (error) {
          console.error(`Error loading ${slug} page:`, error);
          // Không set alert ở đây để tránh nhiều thông báo lỗi
        }
      }
      setStaticPages(pages);
    } catch (error) {
      console.error('Error in loadStaticPages:', error);
      showAlert('error', 'Không thể tải nội dung trang tĩnh');
    }
  };

  const handleSaveForm = async () => {
    setLoading(true);
    try {
      const settingsData = {
        company_name: formData.businessName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        opening_hours: formData.openingHours
      };
      
      const response = await axios.put('/api/settings', settingsData);
      console.log('Save settings response:', response);
      
      if (response?.data?.success) {
        showAlert('success', 'Đã lưu thông tin cài đặt');
        loadSettings(); // Reload data after successful save
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Không thể lưu thông tin cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (slug) => {
    setEditingSlug(slug);
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
  };

  const handleSavePage = async (slug) => {
    setLoading(true);
    try {
      const pageData = {
        slug,
        title: staticPages[slug].title,
        content: staticPages[slug].content
      };
      
      const response = await axios.put(`/api/static-pages/${slug}`, pageData);
      console.log(`Save ${slug} page response:`, response.data);
      
      if (response?.data?.success) {
        showAlert('success', 'Đã lưu nội dung trang');
        // Update local state with returned data
        setStaticPages(prev => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            ...response.data.data // Spread response data
          }
        }));
        setEditingSlug(null); // Exit edit mode after successful save
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error(`Error saving ${slug} page:`, error);
      showAlert('error', 'Không thể lưu nội dung trang');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePageContentChange = (slug, content) => {
    setStaticPages(prev => ({
      ...prev,
      [slug]: { ...prev[slug], content }
    }));
  };

  const showAlert = (severity, message) => {
    setAlert({ show: true, severity, message });
    setTimeout(() => setAlert({ show: false, severity: '', message: '' }), 3000);
  };

  const renderBusinessForm = () => (
    <Box component={Paper} sx={{ p: { xs: 1, md: 3 },borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thông tin doanh nghiệp
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tên doanh nghiệp"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={{ xs: 3, md: 4 }}
            label="Mô tả"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Giờ mở cửa"
            value={formData.openingHours}
            onChange={(e) => handleInputChange('openingHours', e.target.value)}
            size="small"
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveForm}
        disabled={loading}
        sx={{ mt: { xs: 2, md: 3 } }}
        fullWidth={{ xs: true, sm: false }}
      >
        Lưu thông tin
      </Button>
    </Box>
  );

  const renderStaticPageEditor = (slug) => {
    const page = staticPages[slug];
    const isEditing = editingSlug === slug;

    return (
      <Box component={Paper} sx={{ p: { xs: 1, md: 3 },borderRadius: 3}}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h6">
            {page.title}
          </Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleEditPage(slug)}
              size="small"
              fullWidth={{ xs: true, sm: false }}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
                disabled={loading}
                size="small"
                fullWidth={{ xs: true, sm: false }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSavePage(slug)}
                disabled={loading}
                size="small"
                fullWidth={{ xs: true, sm: false }}
              >
                Lưu
              </Button>
            </Box>
          )}
        </Box>

        <AnimatePresence mode="wait">
          <TabTransition key={isEditing ? 'edit' : 'display'}>
            {!isEditing ? (
              // Display mode - show saved content
              <Box 
                sx={{
                  p: { xs: 1, md: 2 },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  minHeight: { xs: '150px', md: '200px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  // Tối ưu hiển thị hình ảnh trên mobile
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '8px auto'
                  },
                  '& p': {
                    margin: '8px 0'
                  }
                }}
              >
                {page.content ? (
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                  <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    Chưa có nội dung. Nhấn "Chỉnh sửa" để thêm nội dung.
                  </Typography>
                )}
              </Box>
            ) : (
              // Edit mode - show editor
              <Box sx={{ 
                '.ql-container': { 
                  minHeight: { xs: '250px', md: '300px' },
                  fontSize: { xs: '0.875rem', md: '1rem' }
                },
                '.ql-toolbar': {
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                },
                // Tối ưu hiển thị hình ảnh trong editor
                '.ql-editor': {
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '8px auto'
                  },
                  '& p': {
                    margin: '8px 0'
                  }
                }
              }}>
                <ReactQuill
                  ref={quillRef}
                  value={page.content}
                  onChange={(content) => handlePageContentChange(slug, content)}
                  modules={quillModules}
                  formats={quillFormats}
                />
              </Box>
            )}
          </TabTransition>
        </AnimatePresence>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      mt: { xs: 2, md: 4 }, 
      mb: { xs: 2, md: 4 },
      px: { xs: 1, sm: 2, md: 3 },
      width: '100%',
      // CSS global cho hình ảnh responsive
      '& img': {
        maxWidth: '100%',
        height: 'auto'
      }
    }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      
      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: { xs: 2, md: 3 },
          '& .MuiTab-root': {
            minHeight: { xs: 40, md: 48 },
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500,
            color: 'text.secondary',
            px: { xs: 1, sm: 2 },
            minWidth: { xs: 'auto', sm: 'auto' },
            '&.Mui-selected': {
              color: 'primary.main'
            },
            '&:focus': {
              outline: 'none'
            },
            '&.Mui-focusVisible': {
              outline: 'none'
            }
          }
        }}
      >
        <Tab label="Thông tin doanh nghiệp" />
        <Tab label="Thông báo trình duyệt" />
        {Object.keys(staticPages).map((slug, index) => (
          <Tab key={slug} label={staticPages[slug].title} />
        ))}
      </Tabs>

      <AnimatePresence mode="wait">
        <TabTransition key={currentTab}>
          {currentTab === 0 ? (
            renderBusinessForm()
          ) : currentTab === 1 ? (
            <BrowserNotificationManager />
          ) : (
            renderStaticPageEditor(Object.keys(staticPages)[currentTab - 2])
          )}
        </TabTransition>
      </AnimatePresence>
    </Box>
  );
};

export default SiteSettings; 