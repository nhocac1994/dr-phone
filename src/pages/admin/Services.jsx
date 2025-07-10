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
  useTheme,
  Grid,
  Avatar,
  Divider,
  CardActions
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';
import CategoryManager from '../../components/CategoryManager';
import ServiceForm from '../../components/ServiceForm';
import { formatCurrency } from '../../utils/format';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageTransition from '../../components/PageTransition';
import TabTransition from '../../components/TabTransition';
import { AnimatePresence, motion } from 'framer-motion';

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
        <AnimatePresence mode="wait">
          <TabTransition key={index}>
            <Box sx={{ p: 2 }}>
              {children}
            </Box>
          </TabTransition>
        </AnimatePresence>
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
      const response = await axios.get('/api/categories');
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Lỗi khi tải danh mục', { variant: 'error' });
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/services');
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
      await axios.delete(`/api/services/${id}`);
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
        await axios.put(`/api/services/${selectedService.id}`, formData);
        enqueueSnackbar('Cập nhật dịch vụ thành công', { variant: 'success' });
      } else {
        await axios.post('/api/services', formData);
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

  const handleRowClick = (service) => {
    navigate(`/admin/services/${service.id}`);
  };

  const handleEditClick = (event, service) => {
    event.stopPropagation();
    navigate(`/admin/services/edit/${service.id}`);
  };

  const handleDeleteClick = (event, service) => {
    event.stopPropagation();
    setSelectedService(service);
    setOpenConfirm(true);
  };

  const ServiceCard = ({ service }) => (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        },
        borderRadius: 2,
        mb: 1
      }}
      onClick={() => handleRowClick(service)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                mb: 0.5,
                lineHeight: 1.3
              }}
            >
              {service.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {service.category_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => handleEditClick(e, service)}
              sx={{ 
                p: 0.5,
                '&:hover': { backgroundColor: 'primary.light' }
              }}
            >
              <EditIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => handleDeleteClick(e, service)}
              sx={{ 
                p: 0.5,
                '&:hover': { backgroundColor: 'error.light' }
              }}
            >
              <DeleteIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {service.sub_category_name || 'Tất cả model'}
            </Typography>
          </Box>
          <Chip
            label={`${service.spare_parts?.length || 0} linh kiện`}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              height: '20px'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
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
          <AnimatePresence mode="wait">
            {!openForm ? (
              <motion.div
                key="services-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
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
                  <>
                    {/* Mobile Card View */}
                    {isMobile ? (
                      <Box sx={{ pb: 2 }}>
                        {displayedServices.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </Box>
                    ) : (
                      /* Desktop Table View */
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Tên dịch vụ</TableCell>
                              <TableCell>Danh mục</TableCell>
                              <TableCell>Model</TableCell>
                              <TableCell align="right">Linh kiện</TableCell>
                              <TableCell align="center">Thao tác</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {displayedServices.map((service) => (
                              <TableRow 
                                key={service.id}
                                hover
                                onClick={() => handleRowClick(service)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <TableCell component="th" scope="row">
                                  {service.name}
                                </TableCell>
                                <TableCell>{service.category_name}</TableCell>
                                <TableCell>{service.sub_category_name || '-'}</TableCell>
                                <TableCell align="right">
                                  {service.spare_parts?.length || 0}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleEditClick(e, service)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => handleDeleteClick(e, service)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {displayedServices.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  Không có dịch vụ nào
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}

                {/* Pagination - Only show on desktop */}
                {!isMobile && (
                  <TablePagination
                    component="div"
                    count={filteredServices.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Hiển thị"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="service-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => setOpenForm(false)} sx={{ p: 0.5 }}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                      {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                    </Typography>
                  </Box>
                  <LoadingButton
                    variant="contained"
                    loading={loading}
                    onClick={() => {
                      document.getElementById('service-form-submit').click();
                    }}
                    sx={{
                      height: '42px',
                      borderRadius: '12px',
                      textTransform: 'none',
                      px: 2
                    }}
                  >
                    {selectedService ? 'Cập nhật' : 'Thêm mới'}
                  </LoadingButton>
                </Box>

                <ServiceForm
                  service={selectedService}
                  onSubmit={handleSubmit}
                  onCancel={() => setOpenForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

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
                  selected={selectedCategory === 'all'}
                >
                  <ListItemText primary="Tất cả" />
                </ListItem>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    button
                    onClick={() => handleCategorySelect(category)}
                    selected={selectedCategory === category.id}
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
    </PageTransition>
  );
}

export default Services; 