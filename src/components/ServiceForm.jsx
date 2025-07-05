import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSnackbar } from 'notistack';
import axios from '../config/axios';

const validationSchema = yup.object({
  name: yup.string().required('Tên dịch vụ là bắt buộc'),
  category_id: yup.number().required('Danh mục là bắt buộc'),
  sub_category_id: yup.number().required('Model sản phẩm là bắt buộc'),
  promotion: yup.string(),
  vip_discount: yup.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá tối đa 100%'),
  student_discount: yup.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá tối đa 100%'),
  content: yup.string(),
  images: yup.array().of(yup.string()),
  spare_parts: yup.array().of(
    yup.object({
      name: yup.string().required('Tên linh kiện là bắt buộc'),
      original_price: yup.number().min(0, 'Giá không hợp lệ').required('Giá linh kiện là bắt buộc'),
      discount_percent: yup.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá tối đa 100%'),
      warranty: yup.string(),
      repair_time: yup.string(),
      description: yup.string()
    })
  )
});

const initialValues = {
  name: '',
  category_id: '',
  sub_category_id: '',
  promotion: '',
  vip_discount: '',
  student_discount: '',
  content: '',
  images: [],
  spare_parts: []
};

export default function ServiceForm({ service, onSubmit, loading, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const formik = useFormik({
    initialValues: service || initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        console.log('Form values before submit:', values);
        
        // Thêm các trường thông tin cơ bản
        Object.keys(values).forEach(key => {
          if (key !== 'images' && key !== 'spare_parts') {
            console.log(`Adding field ${key}:`, values[key]);
            formData.append(key, values[key]);
          }
        });

        // Thêm hình ảnh mới
        console.log('Image files to upload:', imageFiles);
        imageFiles.forEach((file, index) => {
          console.log(`Adding image file ${index}:`, file.name);
          formData.append('images', file);
        });

        // Thêm hình ảnh cũ nếu có
        if (values.images && Array.isArray(values.images)) {
          console.log('Old images:', values.images);
          formData.append('oldImages', JSON.stringify(values.images));
        }

        // Thêm linh kiện
        console.log('Spare parts:', values.spare_parts);
        formData.append('spare_parts', JSON.stringify(values.spare_parts));

        // Log toàn bộ FormData
        for (let pair of formData.entries()) {
          console.log('FormData entry:', pair[0], pair[1]);
        }

        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
        enqueueSnackbar('Lỗi khi gửi form: ' + error.message, { variant: 'error' });
      }
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formik.values.category_id) {
      fetchSubCategories(formik.values.category_id);
    } else {
      setSubCategories([]);
    }
  }, [formik.values.category_id]);

  useEffect(() => {
    if (service) {
      console.log('Service data loaded:', service);
      console.log('Spare parts:', service.spare_parts);
      
      // Chuyển đổi images thành mảng và lọc ra các giá trị hợp lệ
      let imageArray = [];
      if (service.images) {
        if (typeof service.images === 'string') {
          imageArray = service.images.split(',').filter(Boolean);
        } else if (Array.isArray(service.images)) {
          imageArray = service.images
            .map(img => {
              if (typeof img === 'string') return img;
              if (img && typeof img === 'object' && img.filename) return img.filename;
              return null;
            })
            .filter(Boolean);
        }
        
        // Tạo URL đầy đủ cho mỗi hình ảnh
        setPreviewImages(
          imageArray.map(img => 
            img.startsWith('http') ? img : `${API_URL}/img/${img}`
          )
        );
      }
    }
  }, [service]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Lỗi khi tải danh mục', { variant: 'error' });
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(`/categories/${categoryId}/sub-categories`);
      setSubCategories(response || []);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      enqueueSnackbar('Lỗi khi tải danh sách model', { variant: 'error' });
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    console.log('Selected files:', files);
    
    if (files.length + previewImages.length > 5) {
      enqueueSnackbar('Chỉ được chọn tối đa 5 hình ảnh', { variant: 'warning' });
      return;
    }

    setImageFiles(prev => {
      const newFiles = [...prev, ...files];
      console.log('Updated image files:', newFiles);
      return newFiles;
    });
    
    // Tạo URL preview cho các file mới
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => {
      const newPreviews = [...prev, ...newPreviewUrls];
      console.log('Updated preview images:', newPreviews);
      return newPreviews;
    });
  };

  const handleRemoveImage = (index) => {
    // Xóa khỏi preview
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Xóa khỏi files nếu là file mới
    if (index < imageFiles.length) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      // Xóa hình ảnh cũ
      const oldImages = formik.values.images || [];
      const adjustedIndex = index - imageFiles.length;
      formik.setFieldValue('images', oldImages.filter((_, i) => i !== adjustedIndex));
    }
  };

  const handleAddSparePart = () => {
    formik.setFieldValue('spare_parts', [
      ...formik.values.spare_parts,
      {
        name: '',
        original_price: '',
        discount_percent: 0,
        warranty: '',
        repair_time: '',
        description: ''
      }
    ]);
  };

  const handleRemoveSparePart = (index) => {
    formik.setFieldValue(
      'spare_parts',
      formik.values.spare_parts.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
          >
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="category_id"
              value={formik.values.category_id}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue('sub_category_id', '');
              }}
              label="Danh mục"
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.sub_category_id && Boolean(formik.errors.sub_category_id)}
            disabled={!formik.values.category_id}
          >
            <InputLabel>Model sản phẩm</InputLabel>
            <Select
              name="sub_category_id"
              value={formik.values.sub_category_id}
              onChange={formik.handleChange}
              label="Model sản phẩm"
            >
              {subCategories.map(model => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="name"
            label="Tên dịch vụ"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="promotion"
            label="Khuyến mãi"
            value={formik.values.promotion}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="vip_discount"
            label="Giảm giá VIP (%)"
            type="number"
            value={formik.values.vip_discount}
            onChange={formik.handleChange}
            error={formik.touched.vip_discount && Boolean(formik.errors.vip_discount)}
            helperText={formik.touched.vip_discount && formik.errors.vip_discount}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="student_discount"
            label="Giảm giá sinh viên (%)"
            type="number"
            value={formik.values.student_discount}
            onChange={formik.handleChange}
            error={formik.touched.student_discount && Boolean(formik.errors.student_discount)}
            helperText={formik.touched.student_discount && formik.errors.student_discount}
          />
        </Grid>

        {/* Nội dung chi tiết */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Nội dung chi tiết</Typography>
          <ReactQuill
            value={formik.values.content}
            onChange={(content) => formik.setFieldValue('content', content)}
          />
        </Grid>

        {/* Hình ảnh */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Hình ảnh (tối đa 5)
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            multiple
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<ImageIcon />}
            >
              Chọn hình ảnh
            </Button>
          </label>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {previewImages.map((url, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.error('Error loading image:', url);
                    e.target.src = 'https://via.placeholder.com/100?text=Error';
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'error.main',
                      color: 'white'
                    }
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Linh kiện */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Danh sách linh kiện</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddSparePart}
            >
              Thêm linh kiện
            </Button>
          </Box>
          {formik.values.spare_parts.map((part, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8
                }}
                onClick={() => handleRemoveSparePart(index)}
              >
                <DeleteIcon />
              </IconButton>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name={`spare_parts.${index}.name`}
                    label="Tên linh kiện"
                    value={part.name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.spare_parts?.[index]?.name &&
                      Boolean(formik.errors.spare_parts?.[index]?.name)
                    }
                    helperText={
                      formik.touched.spare_parts?.[index]?.name &&
                      formik.errors.spare_parts?.[index]?.name
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name={`spare_parts.${index}.original_price`}
                    label="Giá linh kiện"
                    type="number"
                    value={part.original_price}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.spare_parts?.[index]?.original_price &&
                      Boolean(formik.errors.spare_parts?.[index]?.original_price)
                    }
                    helperText={
                      formik.touched.spare_parts?.[index]?.original_price &&
                      formik.errors.spare_parts?.[index]?.original_price
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name={`spare_parts.${index}.discount_percent`}
                    label="Giảm giá (%)"
                    type="number"
                    value={part.discount_percent}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.spare_parts?.[index]?.discount_percent &&
                      Boolean(formik.errors.spare_parts?.[index]?.discount_percent)
                    }
                    helperText={
                      formik.touched.spare_parts?.[index]?.discount_percent &&
                      formik.errors.spare_parts?.[index]?.discount_percent
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name={`spare_parts.${index}.warranty`}
                    label="Bảo hành"
                    value={part.warranty}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name={`spare_parts.${index}.repair_time`}
                    label="Thời gian sửa chữa"
                    value={part.repair_time}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    name={`spare_parts.${index}.description`}
                    label="Mô tả"
                    value={part.description}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Grid>

        {/* Submit button */}
        <Grid item xs={12}>
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
          >
            {service ? 'Cập nhật' : 'Thêm mới'}
          </LoadingButton>
        </Grid>

        {/* Hidden submit button that can be triggered from parent */}
        <button 
          type="submit" 
          id="service-form-submit" 
          style={{ display: 'none' }}
        />
      </Grid>
    </form>
  );
}