import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Tabs, Tab, Paper, Typography, Button, Stack, TextField, CircularProgress, Snackbar, Alert, Container, IconButton, Grid, Avatar
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from '../../config/axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

const PAGE_SLUGS = [
  { slug: 'company', label: 'Thông tin doanh nghiệp' },
  { slug: 'payment', label: 'Hình thức thanh toán' },
  { slug: 'warranty', label: 'Chính sách bảo hành' },
  { slug: 'privacy', label: 'Chính sách bảo mật' },
  { slug: 'return', label: 'Chính sách đổi trả' },
  { slug: 'recruitment', label: 'Tuyển dụng' },
  { slug: 'about', label: 'Giới thiệu' },
  { slug: 'news', label: 'Tin tức' },
  { slug: 'partners', label: 'Đối tác thương hiệu' },
  { slug: 'owner', label: 'Thông tin chủ sở hữu Website' },
  { slug: 'license', label: 'Giấy phép ủy quyền' }
];

const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }
};

export default function SiteSettings() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    company_name: '', phone: '', phone_feedback: '', address: '', email: '',
    facebook: '', youtube: '', zalo: '', tiktok: '', messenger: '', instagram: '',
    certificates: []
  });
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load dữ liệu
  useEffect(() => {
    Promise.all([
      axios.get('/api/settings'),
      ...PAGE_SLUGS.slice(1).map(p => axios.get(`/api/static-pages/${p.slug}`).catch(() => ({ data: { content: '' } })))
    ]).then(([settingsRes, ...pagesRes]) => {
      setForm(settingsRes.data || {});
      const obj = {};
      pagesRes.forEach((res, idx) => {
        obj[PAGE_SLUGS[idx + 1].slug] = res.data.content || '';
      });
      setPages(obj);
      setLoading(false);
    });
  }, []);

  const handleChangeTab = (_, newTab) => setTab(newTab);

  // Thông tin doanh nghiệp
  const handleChangeForm = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Upload nhiều ảnh chứng chỉ
  const handleUploadCertificates = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const uploaded = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      uploaded.push(res.data.filename);
    }
    setForm(f => ({ ...f, certificates: [...(f.certificates || []), ...uploaded] }));
  };
  const handleRemoveCertificate = (img) => {
    setForm(f => ({ ...f, certificates: (f.certificates || []).filter(i => i !== img) }));
  };

  const handleSaveForm = async () => {
    setSaving(true);
    try {
      await axios.put('/api/settings', form);
      setSnackbar({ open: true, message: 'Đã lưu thông tin doanh nghiệp!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi lưu!', severity: 'error' });
    }
    setSaving(false);
  };

  // Trang tĩnh
  const handleChangeContent = useCallback((value) => {
    setPages(p => ({ ...p, [PAGE_SLUGS[tab].slug]: value }));
  }, [tab]);

  const handleSavePage = async () => {
    setSaving(true);
    try {
      const content = pages[PAGE_SLUGS[tab].slug];
      if (content && content.length > 1000000) {
        setSnackbar({ 
          open: true, 
          message: 'Nội dung quá lớn! Vui lòng giảm kích thước hình ảnh hoặc chia nhỏ nội dung.', 
          severity: 'error' 
        });
        setSaving(false);
        return;
      }
      // Nếu trang chưa tồn tại, tạo mới
      try {
        await axios.post('/api/static-pages', {
          slug: PAGE_SLUGS[tab].slug,
          title: PAGE_SLUGS[tab].label,
          content
        });
        setSnackbar({ open: true, message: 'Đã lưu nội dung!', severity: 'success' });
      } catch (createError) {
        // Nếu trang đã tồn tại, cập nhật
        await axios.put(`/api/static-pages/${PAGE_SLUGS[tab].slug}`, { content });
        setSnackbar({ open: true, message: 'Đã cập nhật nội dung!', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.status === 413 
          ? 'Nội dung quá lớn! Vui lòng giảm kích thước hình ảnh.' 
          : 'Lỗi khi lưu!', 
        severity: 'error' 
      });
    }
    setSaving(false);
  };

  if (loading) return (
    <Box sx={{ position: 'relative', minHeight: '60vh' }}>
      <Box sx={{
        position: 'absolute', zIndex: 2000, top: 0, left: 0, width: '100%', height: '100%',
        bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: { xs: 0, md: 2 } }}>
      <Container maxWidth="md" sx={{ py: { xs: 1, md: 3 } }}>
        <Paper sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 3, boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.08)' }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid #eee', mb: 2 }}
          >
            {PAGE_SLUGS.map(p => <Tab key={p.slug} label={p.label} />)}
          </Tabs>
          <Box mt={2}>
            {tab === 0 ? (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700} color="primary.main">Thông tin doanh nghiệp</Typography>
                <TextField label="Tên doanh nghiệp" name="company_name" value={form.company_name || ''} onChange={handleChangeForm} fullWidth size="small" />
                <TextField label="Số điện thoại tổng đài" name="phone" value={form.phone || ''} onChange={handleChangeForm} fullWidth size="small" />
                <TextField label="Số điện thoại phản ánh" name="phone_feedback" value={form.phone_feedback || ''} onChange={handleChangeForm} fullWidth size="small" />
                <TextField label="Địa chỉ" name="address" value={form.address || ''} onChange={handleChangeForm} fullWidth size="small" />
                <TextField label="Email" name="email" value={form.email || ''} onChange={handleChangeForm} fullWidth size="small" />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Facebook" name="facebook" value={form.facebook || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Youtube" name="youtube" value={form.youtube || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Zalo" name="zalo" value={form.zalo || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="TikTok" name="tiktok" value={form.tiktok || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Messenger" name="messenger" value={form.messenger || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Instagram" name="instagram" value={form.instagram || ''} onChange={handleChangeForm} fullWidth size="small" /></Grid>
                </Grid>
                <Box>
                  <Typography fontWeight={600} mb={1}>Ảnh chứng chỉ/giấy phép (có thể chọn nhiều)</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ mb: 1 }}
                  >
                    Tải lên ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleUploadCertificates}
                    />
                  </Button>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {(form.certificates || []).map((img, idx) => (
                      <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={img.startsWith('http') ? img : `/img/${img}`}
                          alt={`certificate-${idx}`}
                          variant="rounded"
                          sx={{ width: 80, height: 80, border: '1px solid #eee', mr: 1 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'white' }}
                          onClick={() => handleRemoveCertificate(img)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSaveForm}
                  disabled={saving}
                  sx={{ alignSelf: 'flex-end', minWidth: 120 }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
              </Stack>
            ) : (
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main" mb={2}>{PAGE_SLUGS[tab].label}</Typography>
                <ReactQuill
                  theme="snow"
                  value={pages[PAGE_SLUGS[tab].slug] || ''}
                  onChange={handleChangeContent}
                  modules={QUILL_MODULES}
                  style={{ minHeight: 200, marginBottom: 16 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSavePage}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu nội dung'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 