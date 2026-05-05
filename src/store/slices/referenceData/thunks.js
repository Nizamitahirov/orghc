import { createAsyncThunk } from '@reduxjs/toolkit';
import { referenceDataAPI } from '../../api/referenceDataAPI';

// ── Fetch thunks ─────────────────────────────────────────────────────────────
export const fetchBusinessFunctions = createAsyncThunk(
  'referenceData/fetchBusinessFunctions',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getBusinessFunctionDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchDepartments = createAsyncThunk(
  'referenceData/fetchDepartments',
  async (businessFunctionId, { rejectWithValue }) => {
    try {
      const res = await referenceDataAPI.getDepartmentDropdown(businessFunctionId);
      return res.data.results || res.data;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchUnits = createAsyncThunk(
  'referenceData/fetchUnits',
  async (departmentId, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getUnitDropdown(departmentId)).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchJobFunctions = createAsyncThunk(
  'referenceData/fetchJobFunctions',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getJobFunctionDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchJobTitles = createAsyncThunk(
  'referenceData/fetchJobTitles',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getJobTitleDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchPositionGroups = createAsyncThunk(
  'referenceData/fetchPositionGroups',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getPositionGroupDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchEmployeeStatuses = createAsyncThunk(
  'referenceData/fetchEmployeeStatuses',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getEmployeeStatusDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchEmployeeTags = createAsyncThunk(
  'referenceData/fetchEmployeeTags',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getEmployeeTagDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchContractConfigs = createAsyncThunk(
  'referenceData/fetchContractConfigs',
  async (_, { rejectWithValue }) => {
    try { return (await referenceDataAPI.getContractConfigDropdown()).data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

export const fetchPositionGroupGradingLevels = createAsyncThunk(
  'referenceData/fetchPositionGroupGradingLevels',
  async (positionGroupId, { rejectWithValue }) => {
    try {
      const res = await referenceDataAPI.getPositionGroupGradingLevels(positionGroupId);
      return { positionGroupId, levels: res.data.levels || [] };
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Job Title CRUD ────────────────────────────────────────────────────────────
export const createJobTitle = createAsyncThunk(
  'referenceData/createJobTitle',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createJobTitle(data); dispatch(fetchJobTitles()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateJobTitle = createAsyncThunk(
  'referenceData/updateJobTitle',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateJobTitle(id, data); dispatch(fetchJobTitles()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteJobTitle = createAsyncThunk(
  'referenceData/deleteJobTitle',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteJobTitle(id); dispatch(fetchJobTitles()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Business Function CRUD ────────────────────────────────────────────────────
export const createBusinessFunction = createAsyncThunk(
  'referenceData/createBusinessFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createBusinessFunction(data); dispatch(fetchBusinessFunctions()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateBusinessFunction = createAsyncThunk(
  'referenceData/updateBusinessFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateBusinessFunction(id, data); dispatch(fetchBusinessFunctions()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteBusinessFunction = createAsyncThunk(
  'referenceData/deleteBusinessFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteBusinessFunction(id); dispatch(fetchBusinessFunctions()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Department CRUD ───────────────────────────────────────────────────────────
export const createDepartment = createAsyncThunk(
  'referenceData/createDepartment',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await referenceDataAPI.createDepartment(data);
      if (data.business_function) dispatch(fetchDepartments(data.business_function));
      return res.data;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateDepartment = createAsyncThunk(
  'referenceData/updateDepartment',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await referenceDataAPI.updateDepartment(id, data);
      const dept = getState().referenceData.departments.find(d => d.id === id || d.value === id);
      if (dept) dispatch(fetchDepartments(dept.business_function));
      return res.data;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteDepartment = createAsyncThunk(
  'referenceData/deleteDepartment',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const dept = getState().referenceData.departments.find(d => d.id === id || d.value === id);
      await referenceDataAPI.deleteDepartment(id);
      if (dept) dispatch(fetchDepartments(dept.business_function));
      return id;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Unit CRUD ─────────────────────────────────────────────────────────────────
export const createUnit = createAsyncThunk(
  'referenceData/createUnit',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await referenceDataAPI.createUnit(data);
      if (data.department) dispatch(fetchUnits(data.department));
      return res.data;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateUnit = createAsyncThunk(
  'referenceData/updateUnit',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await referenceDataAPI.updateUnit(id, data);
      const unit = getState().referenceData.units.find(u => u.id === id || u.value === id);
      if (unit) dispatch(fetchUnits(unit.department));
      return res.data;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteUnit = createAsyncThunk(
  'referenceData/deleteUnit',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const unit = getState().referenceData.units.find(u => u.id === id || u.value === id);
      await referenceDataAPI.deleteUnit(id);
      if (unit) dispatch(fetchUnits(unit.department));
      return id;
    } catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Job Function CRUD ─────────────────────────────────────────────────────────
export const createJobFunction = createAsyncThunk(
  'referenceData/createJobFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createJobFunction(data); dispatch(fetchJobFunctions()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateJobFunction = createAsyncThunk(
  'referenceData/updateJobFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateJobFunction(id, data); dispatch(fetchJobFunctions()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteJobFunction = createAsyncThunk(
  'referenceData/deleteJobFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteJobFunction(id); dispatch(fetchJobFunctions()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Position Group CRUD ───────────────────────────────────────────────────────
export const createPositionGroup = createAsyncThunk(
  'referenceData/createPositionGroup',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createPositionGroup(data); dispatch(fetchPositionGroups()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updatePositionGroup = createAsyncThunk(
  'referenceData/updatePositionGroup',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updatePositionGroup(id, data); dispatch(fetchPositionGroups()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deletePositionGroup = createAsyncThunk(
  'referenceData/deletePositionGroup',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deletePositionGroup(id); dispatch(fetchPositionGroups()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Employee Status CRUD ──────────────────────────────────────────────────────
export const createEmployeeStatus = createAsyncThunk(
  'referenceData/createEmployeeStatus',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createEmployeeStatus(data); dispatch(fetchEmployeeStatuses()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateEmployeeStatus = createAsyncThunk(
  'referenceData/updateEmployeeStatus',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateEmployeeStatus(id, data); dispatch(fetchEmployeeStatuses()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteEmployeeStatus = createAsyncThunk(
  'referenceData/deleteEmployeeStatus',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteEmployeeStatus(id); dispatch(fetchEmployeeStatuses()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Employee Tag CRUD ─────────────────────────────────────────────────────────
export const createEmployeeTag = createAsyncThunk(
  'referenceData/createEmployeeTag',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createEmployeeTag(data); dispatch(fetchEmployeeTags()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateEmployeeTag = createAsyncThunk(
  'referenceData/updateEmployeeTag',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateEmployeeTag(id, data); dispatch(fetchEmployeeTags()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteEmployeeTag = createAsyncThunk(
  'referenceData/deleteEmployeeTag',
  async ({ id }, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteEmployeeTag(id); dispatch(fetchEmployeeTags()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);

// ── Contract Config CRUD ──────────────────────────────────────────────────────
export const createContractConfig = createAsyncThunk(
  'referenceData/createContractConfig',
  async (data, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.createContractConfig(data); dispatch(fetchContractConfigs()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const updateContractConfig = createAsyncThunk(
  'referenceData/updateContractConfig',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const res = await referenceDataAPI.updateContractConfig(id, data); dispatch(fetchContractConfigs()); return res.data; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
export const deleteContractConfig = createAsyncThunk(
  'referenceData/deleteContractConfig',
  async (id, { rejectWithValue, dispatch }) => {
    try { await referenceDataAPI.deleteContractConfig(id); dispatch(fetchContractConfigs()); return id; }
    catch (e) { return rejectWithValue(e.data || e.message); }
  }
);
