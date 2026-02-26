// src/app/asset-management/batches/create/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { batchService, categoryService } from "@/services/assetService";
import {
  ArrowLeft,
  Package,
  Loader,
  CheckCircle,
  XCircle,
  Building,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  BarChart3 
} from "lucide-react";
import Link from "next/link";
import SearchableDropdown from "@/components/common/SearchableDropdown";

const CreateBatchPage = () => {
  const router = useRouter();
  const { darkMode } = useTheme();

  // State
  const [formData, setFormData] = useState({
    asset_name: '',
    category: '',
    initial_quantity: 1,
    unit_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    useful_life_years: 5,
    supplier: '',
    purchase_order_number: '',
    warranty_expiry_date: '',
    notes: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.results || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!formData.asset_name.trim()) {
        throw new Error('Asset name is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (formData.initial_quantity < 1) {
        throw new Error('Initial quantity must be at least 1');
      }
      if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
        throw new Error('Unit price must be greater than 0');
      }
      if (!formData.purchase_date) {
        throw new Error('Purchase date is required');
      }

      // 🎯 Backend structure: POST /assets/batches/
      const batchData = {
        asset_name: formData.asset_name.trim(),
        category: parseInt(formData.category),
        initial_quantity: parseInt(formData.initial_quantity),
        unit_price: parseFloat(formData.unit_price),
        purchase_date: formData.purchase_date,
        useful_life_years: parseInt(formData.useful_life_years) || 5,
        supplier: formData.supplier.trim() || '',
        purchase_order_number: formData.purchase_order_number.trim() || '',
        warranty_expiry_date: formData.warranty_expiry_date || null,
        notes: formData.notes.trim() || ''
      };

   

      const result = await batchService.createBatch(batchData);
      
   

      setNotification({
        type: 'success',
        message: `Batch created successfully: ${result.batch?.batch_number || 'Success'}`
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/settings/asset-mng/batches');
      }, 2000);

    } catch (err) {
      console.error('❌ Batch creation error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message ||
                          'Failed to create batch';
      setError(errorMessage);
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total value
  const totalValue = formData.initial_quantity && formData.unit_price 
    ? (parseFloat(formData.initial_quantity) * parseFloat(formData.unit_price)).toFixed(2)
    : '0.00';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="text-sm">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2">
                <XCircle size={14} />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <Link
              href="/settings/asset-mng/batches"
              className={`${textMuted} hover:${textPrimary} flex items-center text-sm mb-4 transition-colors`}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Batches
            </Link>

            <div>
              <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Create Asset Batch</h1>
              <p className={`${textMuted} text-sm`}>
                Create a new batch of assets for bulk inventory management
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                  <h2 className={`${textPrimary} text-lg font-semibold mb-6 flex items-center`}>
                    <Package size={18} className="mr-2 text-almet-sapphire" />
                    Basic Information
                  </h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-start">
                      <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Asset Name *
                      </label>
                      <input
                        type="text"
                        name="asset_name"
                        value={formData.asset_name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="e.g., Dell Latitude 5420 Laptop"
                      />
                      <p className={`${textMuted} text-xs mt-1`}>
                        The name that will be used for all assets in this batch
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Category *
                      </label>
                      {categoriesLoading ? (
                        <div className={`flex items-center justify-center p-3 border ${borderColor} rounded-lg`}>
                          <Loader size={16} className="animate-spin mr-2" />
                          <span className={`${textMuted} text-sm`}>Loading...</span>
                        </div>
                      ) : (
                        <SearchableDropdown
                          options={categoryOptions}
                          value={formData.category}
                          onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          placeholder="Select category"
                          searchPlaceholder="Search categories..."
                          darkMode={darkMode}
                          icon={<Building size={12} />}
                        />
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Initial Quantity *
                      </label>
                      <input
                        type="number"
                        name="initial_quantity"
                        value={formData.initial_quantity}
                        onChange={handleChange}
                        required
                        min="1"
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="e.g., 10"
                      />
                      <p className={`${textMuted} text-xs mt-1`}>
                        Number of assets in this batch
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Unit Price (AZN) *
                      </label>
                      <div className="relative">
                        <DollarSign size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                        <input
                          type="number"
                          name="unit_price"
                          value={formData.unit_price}
                          onChange={handleChange}
                          required
                          min="0.01"
                          step="0.01"
                          className={`w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                          placeholder="0.00"
                        />
                      </div>
                      <p className={`${textMuted} text-xs mt-1`}>
                        Price per single asset
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Purchase Date *
                      </label>
                      <div className="relative">
                        <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                        <input
                          type="date"
                          name="purchase_date"
                          value={formData.purchase_date}
                          onChange={handleChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Useful Life (Years) *
                      </label>
                      <input
                        type="number"
                        name="useful_life_years"
                        value={formData.useful_life_years}
                        onChange={handleChange}
                        required
                        min="1"
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="5"
                      />
                      <p className={`${textMuted} text-xs mt-1`}>
                        Expected useful life for depreciation
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Warranty Expiry Date
                      </label>
                      <div className="relative">
                        <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                        <input
                          type="date"
                          name="warranty_expiry_date"
                          value={formData.warranty_expiry_date}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                  <h2 className={`${textPrimary} text-lg font-semibold mb-6 flex items-center`}>
                    <FileText size={18} className="mr-2 text-almet-sapphire" />
                    Additional Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Supplier
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="e.g., Tech Solutions Ltd"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Purchase Order Number
                      </label>
                      <input
                        type="text"
                        name="purchase_order_number"
                        value={formData.purchase_order_number}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="e.g., PO-2025-001"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                        className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm outline-none transition-all`}
                        placeholder="Add any additional notes about this batch..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-6">
                {/* Batch Summary */}
                <div className={`${bgCard} rounded-xl border ${borderColor} p-6 sticky top-6`}>
                  <h3 className={`${textPrimary} text-lg font-semibold mb-6 flex items-center`}>
                    <BarChart3 size={18} className="mr-2 text-almet-sapphire" />
                    Batch Summary
                  </h3>

                  <div className="space-y-4">
                    <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                      <p className={`${textMuted} text-xs mb-1`}>Total Assets</p>
                      <p className={`${textPrimary} text-2xl font-bold`}>
                        {formData.initial_quantity || 0}
                      </p>
                    </div>

                    <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                      <p className={`${textMuted} text-xs mb-1`}>Unit Price</p>
                      <p className={`${textPrimary} text-xl font-bold`}>
                        {formatCurrency(parseFloat(formData.unit_price) || 0)}
                      </p>
                    </div>

                    <div className={`${bgAccent} rounded-lg p-4 border ${borderColor} bg-almet-sapphire/10`}>
                      <p className={`${textMuted} text-xs mb-1`}>Total Batch Value</p>
                      <p className={`${textPrimary} text-2xl font-bold text-almet-sapphire`}>
                        {formatCurrency(parseFloat(totalValue))}
                      </p>
                      <p className={`${textMuted} text-xs mt-2`}>
                        {formData.initial_quantity} × {formatCurrency(parseFloat(formData.unit_price) || 0)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${textMuted} text-xs`}>Category</span>
                        <span className={`${textSecondary} text-xs font-medium`}>
                          {formData.category 
                            ? categories.find(c => c.id === parseInt(formData.category))?.name 
                            : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${textMuted} text-xs`}>Useful Life</span>
                        <span className={`${textSecondary} text-xs font-medium`}>
                          {formData.useful_life_years} years
                        </span>
                      </div>
                      {formData.supplier && (
                        <div className="flex justify-between items-center">
                          <span className={`${textMuted} text-xs`}>Supplier</span>
                          <span className={`${textSecondary} text-xs font-medium truncate ml-2`}>
                            {formData.supplier}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || categoriesLoading}
                    className={`w-full ${btnPrimary} px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center hover:shadow-lg transition-all duration-200`}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Creating Batch...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Create Batch
                      </>
                    )}
                  </button>

                  <Link
                    href="/settings/asset-mng/batches"
                    className={`w-full ${btnSecondary} px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center hover:shadow-md transition-all duration-200`}
                  >
                    Cancel
                  </Link>
                </div>

                {/* Help Text */}
                <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                  <div className="flex items-start">
                    <AlertCircle size={16} className={`${textMuted} mr-2 mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className={`${textPrimary} text-xs font-medium mb-1`}>About Batches</p>
                      <p className={`${textMuted} text-xs`}>
                        Batches allow you to manage multiple identical assets together. After creating a batch, 
                        you can generate individual assets with unique serial numbers from it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateBatchPage;