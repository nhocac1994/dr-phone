import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
  TablePagination,
  Tab,
  Tabs,
  Alert,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';
import CategoryManager from '../../components/CategoryManager';
import ServiceForm from '../../components/ServiceForm';
import { formatCurrency } from '../../utils/format';
import ConfirmDialog from '../../components/ConfirmDialog';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SlideUpTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SlideLeftTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [openCategoryFilter, setOpenCategoryFilter] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Lỗi khi tải danh mục', { variant: 'error' });
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/services');
      setServices(response || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      enqueueSnackbar('Lỗi khi tải danh sách dịch vụ', { variant: 'error' });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/services/${id}`);
      enqueueSnackbar('Xóa dịch vụ thành công', { variant: 'success' });
      fetchServices();
      setOpenConfirm(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (selectedService) {
        await axios.put(`/services/${selectedService.id}`, formData);
        enqueueSnackbar('Cập nhật dịch vụ thành công', { variant: 'success' });
      } else {
        await axios.post('/services', formData);
        enqueueSnackbar('Thêm dịch vụ thành công', { variant: 'success' });
      }
      setOpenForm(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedServices = filteredServices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAddService = () => {
    setSelectedService(null);
    setOpenForm(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category?.id || 'all');
    setOpenCategoryFilter(false);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 3 } }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
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
          <Tab 
            icon={<BuildIcon sx={{ fontSize: '1.2rem' }} />} 
            iconPosition="start" 
            label="Dịch vụ"
            title="Quản lý dịch vụ sửa chữa"
            disableRipple
          />
          <Tab 
            icon={<CategoryIcon sx={{ fontSize: '1.2rem' }} />} 
            iconPosition="start" 
            label="Danh mục"
            title="Quản lý danh mục"
            disableRipple
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {!openForm ? (
          <>
            {/* Search and Filter Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row' },
              gap: { xs: 1, md: 2 },
              mb: 2,
              alignItems: 'center'
            }}>
              <TextField
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: '1.2rem' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'background.paper',
                    height: '42px'
                  }
                }}
              />
              
              <Button
                variant="outlined"
                onClick={() => setOpenCategoryFilter(true)}
                sx={{
                  minWidth: { xs: '42px', md: '42px' },
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: { xs: 1, md: 1 }
                }}
              >
                <FilterListIcon sx={{ fontSize: '1.2rem' }} />
              </Button>

              <Button
                variant="contained"
                onClick={handleAddService}
                sx={{
                  display: { xs: 'flex', md: 'flex' },
                  minWidth: { xs: '42px', md: 'auto' },
                  height: '42px',
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: { xs: 1, md: 2 },
                  gap: 0.5
                }}
              >
                <AddIcon sx={{ fontSize: '1.2rem' }} />
                {!isMobile && 'Add'}
              </Button>
            </Box>

            {/* Services List */}
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : displayedServices.length === 0 ? (
              <Alert severity="info">Không tìm thấy dịch vụ nào</Alert>
            ) : (
              <Stack spacing={2}>
                {displayedServices.map((service) => (
                  <Card 
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setOpenForm(true);
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            objectFit: 'cover'
                          }}
                          image={service.images?.[0] || '/placeholder.png'}
                          alt={service.name}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {service.description}
                          </Typography>
                          <Typography variant="subtitle2" color="primary">
                            {formatCurrency(service.price)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box 
                        sx={{ 
                          mt: 2,
                          pt: 2,
                          borderTop: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                            setOpenForm(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                            setOpenConfirm(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <TablePagination
              component="div"
              count={filteredServices.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Hiển thị"
            />
          </>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h6">
                {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </Typography>
              <IconButton onClick={() => setOpenForm(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <ServiceForm
              service={selectedService}
              onSubmit={handleSubmit}
              onCancel={() => setOpenForm(false)}
            />
          </>
        )}

        {/* Category Filter Dialog */}
        <Dialog
          open={openCategoryFilter}
          onClose={() => setOpenCategoryFilter(false)}
          TransitionComponent={isMobile ? SlideUpTransition : SlideLeftTransition}
          PaperProps={{
            sx: {
              position: 'fixed',
              ...(isMobile ? {
                bottom: 0,
                m: 0,
                width: '100%',
                height: '60%',
                maxHeight: '60%',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              } : {
                right: 0,
                height: '100%',
                m: 0,
                width: '30%',
                minWidth: '300px',
                borderTopLeftRadius: '16px',
                borderBottomLeftRadius: '16px'
              })
            }
          }}
          fullScreen={false}
        >
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Chọn danh mục</Typography>
              <IconButton onClick={() => setOpenCategoryFilter(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              <ListItem 
                button 
                onClick={() => handleCategorySelect(null)}
                selected={!selectedCategory}
              >
                <ListItemText primary="Tất cả" />
              </ListItem>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  button
                  onClick={() => handleCategorySelect(category)}
                  selected={selectedCategory?.id === category.id}
                >
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={openConfirm}
          onClose={() => {
            setOpenConfirm(false);
            setSelectedService(null);
          }}
          onConfirm={() => handleDelete(selectedService?.id)}
          title="Xác nhận xóa"
          content="Bạn có chắc chắn muốn xóa dịch vụ này?"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CategoryManager />
      </TabPanel>
    </Box>
  );
}

export default Services; 