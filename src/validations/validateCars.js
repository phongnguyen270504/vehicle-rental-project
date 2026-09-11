const validateName = (name) => {
  if (typeof name !== 'string' || name.trim() === '') {
    return 'Tên xe không được để trống';
  }
  return null;
}

const validatePricePerDay = (pricePerDay) => {
  if(pricePerDay === undefined || pricePerDay === '') {
    return 'Giá thuê mỗi ngày không được để trống';
  }

  const value = Number(pricePerDay);
  if (!Number.isFinite(value)) {
    return 'Giá thuê phải là số';
  }
  if (value <= 0) {
    return 'Giá thuê phải lớn hơn 0';
  }
  return null;
  
}

const validateStatus = (status) => {
  const validStatuses = ['available', 'rented', 'maintenance'];
  if(typeof status !== 'string' || !validStatuses.includes(status)) 
  {
    return 'Trạng thái xe không hợp lệ';
  }
    return null;
  }

const validateUpdateCar = (carData) => {
  const errors = {};
  if (carData.name !== undefined) {
    const nameError = validateName(carData.name);
    if (nameError) errors.name = nameError;
  }
  if (carData.price_per_day !== undefined) {
    const priceError = validatePricePerDay(carData.price_per_day);
    if (priceError) errors.price_per_day = priceError;
  }
  if (carData.status !== undefined) {
    const statusError = validateStatus(carData.status);
    if (statusError) errors.status = statusError;
  }
  return errors;
};

const validateCreateCar = (carData) => {
  const errors = {};
  const nameError = validateName(carData.name);
  if (nameError) errors.name = nameError;
  const priceError = validatePricePerDay(carData.price_per_day);
  if (priceError) errors.price_per_day = priceError;
  
  return errors;
}

module.exports = {
  validateUpdateCar,
  validateCreateCar
};