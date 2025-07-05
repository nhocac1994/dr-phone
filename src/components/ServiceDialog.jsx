import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  Alert,
  Stack,
  FormHelperText,
  Slide
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add as AddIcon, Delete as DeleteIcon, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const validationSchema = yup.object({
  name: yup.string().required('Tên dịch vụ là bắt buộc'),
  category_id: yup.number().required('Danh mục là bắt buộc'),
  sub_category_id: yup.number(),
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
  sub_category_id: '',
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ServiceDialog = ({ open, onClose, title, children, maxWidth = 'md', fullWidth = true, actions }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ServiceDialog; 