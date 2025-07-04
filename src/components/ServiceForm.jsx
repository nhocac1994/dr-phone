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
  price: yup.number().min(0, 'Giá không hợp lệ').required('Giá dịch vụ là bắt buộc'),
  warranty: yup.string(),
  repair_time: yup.string(),
  promotion: yup.string(),
  vip_discount: yup.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá tối đa 100%'),
  student_discount: yup.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá tối đa 100%'),
  description: yup.string(),
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
  price: '',
  warranty: '',
  repair_time: '',
  promotion: '',
  vip_discount: '',
  student_discount: '',
  description: '',
  content: '',
  images: [],
  spare_parts: []
};

export default function ServiceForm({ service, onSubmit, loading }) {
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: service || initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      
      // Thêm các trường thông tin cơ bản
      Object.keys(values).forEach(key => {
        if (key !== 'images' && key !== 'spare_parts') {
          formData.append(key, values[key]);
        }
      });

      // Thêm hình ảnh
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Thêm linh kiện
      formData.append('spare_parts', JSON.stringify(values.spare_parts));

      await onSubmit(formData);
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (service?.images) {
      setPreviewImages(service.images);
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

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + previewImages.length > 5) {
      enqueueSnackbar('Chỉ được chọn tối đa 5 hình ảnh', { variant: 'warning' });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
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
          <FormControl 
            fullWidth 
            error={formik.touched.category_id && Boolean(formik.errors.category_id)}
          >
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="category_id"
              value={formik.values.category_id}
              onChange={formik.handleChange}
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
          <TextField
            fullWidth
            name="price"
            label="Giá dịch vụ"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">₫</InputAdornment>,
            }}
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="warranty"
            label="Bảo hành"
            value={formik.values.warranty}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="repair_time"
            label="Thời gian sửa chữa"
            value={formik.values.repair_time}
            onChange={formik.handleChange}
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

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="description"
            label="Mô tả ngắn"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Nội dung chi tiết
          </Typography>
          <ReactQuill
            value={formik.values.content}
            onChange={(content) => formik.setFieldValue('content', content)}
            style={{ height: '200px', marginBottom: '50px' }}
          />
        </Grid>

        {/* Hình ảnh */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
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
              startIcon={<AddIcon />}
              disabled={previewImages.length >= 5}
            >
              Chọn hình ảnh
            </Button>
          </label>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {previewImages.map((image, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                }}
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'background.paper'
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Linh kiện */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Danh sách linh kiện
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSparePart}
            >
              Thêm linh kiện
            </Button>
          </Box>

          <Stack spacing={2}>
            {formik.values.spare_parts.map((part, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
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
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tên linh kiện"
                      name={`spare_parts.${index}.name`}
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
                      label="Giá gốc"
                      name={`spare_parts.${index}.original_price`}
                      type="number"
                      value={part.original_price}
                      onChange={formik.handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                      }}
                      error={
                        formik.touched.spare_parts?.[index]?.original_price &&
                        Boolean(formik.errors.spare_parts?.[index]?.original_price)
                      }
                      helperText={
                        formik.touched.spare_parts?.[index]?.original_price &&
                        formik.errors.spare_parts?.[index]?.original_price
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Giảm giá (%)"
                      name={`spare_parts.${index}.discount_percent`}
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Bảo hành"
                      name={`spare_parts.${index}.warranty`}
                      value={part.warranty}
                      onChange={formik.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Thời gian sửa chữa"
                      name={`spare_parts.${index}.repair_time`}
                      value={part.repair_time}
                      onChange={formik.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả"
                      name={`spare_parts.${index}.description`}
                      value={part.description}
                      onChange={formik.handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
            >
              {service ? 'Cập nhật' : 'Thêm mới'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
}