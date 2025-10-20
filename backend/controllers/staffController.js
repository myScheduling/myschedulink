const Staff = require('../models/Staff');
const Service = require('../models/Service');

// GET all staff για τον επαγγελματία
const getMyStaff = async (req, res) => {
    try {
        const businessId = req.user._id;
        
        const staff = await Staff.find({ 
            business: businessId,
            isActive: true
        })
        .populate('services', 'name duration price')
        .sort({ displayOrder: 1 });

        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET single staff member
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user._id;

        const staff = await Staff.findOne({ 
            _id: id, 
            business: businessId 
        }).populate('services');

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// CREATE new staff member
const createStaff = async (req, res) => {
    try {
        const businessId = req.user._id;
        const { name, email, phone, bio, services, workingHours } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Validate services exist (only validate if services provided)
        let validatedServices = [];
        if (services && services.length > 0) {
            // Filter out any empty or invalid IDs
            const cleanServiceIds = services.filter(id => id && id.trim() !== '');
            
            if (cleanServiceIds.length > 0) {
                const validServices = await Service.find({ 
                    _id: { $in: cleanServiceIds }, 
                    professional: businessId 
                });
                
                // Use only the valid service IDs found
                validatedServices = validServices.map(s => s._id);
                
                console.log(`✅ Validated ${validatedServices.length} services out of ${cleanServiceIds.length} provided`);
            }
        }

        const staff = await Staff.create({
            business: businessId,
            name,
            email,
            phone,
            bio,
            services: validatedServices,
            workingHours: workingHours || {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: []
            }
        });

        const populatedStaff = await Staff.findById(staff._id).populate('services');
        res.status(201).json(populatedStaff);
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// UPDATE staff member
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user._id;
        const { name, email, phone, bio, services, workingHours, isActive, displayOrder } = req.body;

        const staff = await Staff.findOne({ _id: id, business: businessId });

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        // Validate services if provided
        let validatedServices = undefined;
        if (services !== undefined && services.length > 0) {
            // Filter out any empty or invalid IDs
            const cleanServiceIds = services.filter(id => id && id.trim() !== '');
            
            if (cleanServiceIds.length > 0) {
                const validServices = await Service.find({ 
                    _id: { $in: cleanServiceIds }, 
                    professional: businessId 
                });
                
                // Use only the valid service IDs found
                validatedServices = validServices.map(s => s._id);
                
                console.log(`✅ Validated ${validatedServices.length} services out of ${cleanServiceIds.length} provided`);
            } else {
                validatedServices = [];
            }
        }

        // Update fields
        if (name !== undefined) staff.name = name;
        if (email !== undefined) staff.email = email;
        if (phone !== undefined) staff.phone = phone;
        if (bio !== undefined) staff.bio = bio;
        if (validatedServices !== undefined) staff.services = validatedServices;
        if (workingHours !== undefined) staff.workingHours = workingHours;
        if (isActive !== undefined) staff.isActive = isActive;
        if (displayOrder !== undefined) staff.displayOrder = displayOrder;

        await staff.save();

        const updatedStaff = await Staff.findById(staff._id).populate('services');
        res.json(updatedStaff);
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE staff member (soft delete)
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user._id;

        const staff = await Staff.findOne({ _id: id, business: businessId });

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        staff.isActive = false;
        await staff.save();

        res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🆕 PUBLIC: Get staff for booking page
const getPublicStaff = async (req, res) => {
    try {
        const { professionalId } = req.params;

        const staff = await Staff.find({ 
            business: professionalId,
            isActive: true
        })
        .populate('services', 'name duration price')
        .sort({ displayOrder: 1 })
        .select('name bio photo services');

        res.json(staff);
    } catch (error) {
        console.error('Error fetching public staff:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    getPublicStaff
};