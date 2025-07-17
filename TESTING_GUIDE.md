# 🧪 Memory Box Platform Testing Guide

## 🚀 Getting Started

### 1. Start Both Applications

#### Option A: Using Batch File (Windows)
```bash
# Double-click or run:
start-both-apps.bat
```

#### Option B: Using PowerShell (Recommended)
```powershell
# Right-click and "Run with PowerShell":
start-both-apps.ps1
```

#### Option C: Manual Start
```bash
# Terminal 1 - Main App
npm run web

# Terminal 2 - Admin Dashboard  
cd admin-dashboard
npm run dev
```

### 2. Application URLs
- **📱 Main App**: http://localhost:19006
- **💼 Admin Dashboard**: http://localhost:3001

---

## 🧪 Testing Checklist

### 📱 **Main App Testing**

#### **🔐 Authentication Testing**
- [ ] Sign up with new email
- [ ] Sign in with existing credentials
- [ ] Verify user profile creation in Firestore
- [ ] Test logout functionality

#### **📋 Navigation Testing**
- [ ] Home tab navigation
- [ ] Folders tab access
- [ ] **Upload tab (Main Focus)**
- [ ] Profile tab functionality

#### **📤 Upload Functionality Testing**

##### **Basic Upload Options**
- [ ] **Take Photo** - Camera access and capture
- [ ] **Choose from Gallery** - Image library access
- [ ] **Scan Document** - Document scanning feature
- [ ] **Record Video** (Premium feature - should show upgrade prompt for free users)
- [ ] **Voice Memory** (Premium feature - should show upgrade prompt)
- [ ] **Upload Document** - File picker functionality

##### **Upload Flow Testing**
1. **Select a File**:
   - [ ] File selection works properly
   - [ ] File information displays correctly

2. **Upload Options**:
   - [ ] **Quick Save** - Direct upload
   - [ ] **Add to Folder** - Folder selection dialog
   - [ ] **Add Tags & Details** - Description input

3. **Progress Tracking**:
   - [ ] Upload progress bar appears
   - [ ] Percentage updates in real-time
   - [ ] Upload completes successfully

4. **Success Feedback**:
   - [ ] Success alert appears
   - [ ] Recent uploads section updates
   - [ ] File appears in recent uploads list

##### **Plan-Based Restrictions**
- [ ] **Free Plan**: 10MB limit enforced
- [ ] **Free Plan**: Image/text files only
- [ ] **Premium/Family**: Larger files allowed
- [ ] **Premium/Family**: Video/audio uploads work

#### **🎨 UI/UX Testing**
- [ ] Upload options are disabled during upload
- [ ] Progress indicator is visible and accurate
- [ ] Recent uploads display correctly
- [ ] Plan information shows properly

---

### 💼 **Admin Dashboard Testing**

#### **🔗 Navigation**
- [ ] Dashboard overview loads
- [ ] Integrations hub accessible
- [ ] Webhooks monitoring available
- [ ] User management sections

#### **⚙️ Integrations Hub**
- [ ] API keys configuration interface
- [ ] Firebase settings display
- [ ] Stripe configuration options
- [ ] Integration status indicators

#### **📊 Webhooks Monitor**
- [ ] Real-time webhook events display
- [ ] Event details are readable
- [ ] Filtering and search functionality

---

## 🔥 Firebase Testing

### **📋 Firestore Data Verification**
After uploading files, check Firebase Console:

1. **Navigate to Firestore Database**
2. **Check Collections**:
   ```
   users/{userId}/
     └── memories/{memoryId}/ ← New documents should appear here
   ```

3. **Verify Memory Documents Contain**:
   - `id`, `userId`, `fileName`, `fileType`, `fileSize`
   - `downloadURL`, `storagePath`
   - `category`, `tags`, `description`
   - `createdAt`, `updatedAt`
   - Upload metadata

### **💾 Storage Verification**
1. **Navigate to Firebase Storage**
2. **Check File Structure**:
   ```
   users/{userId}/
     └── memories/
         ├── photo1.jpg
         ├── document.pdf
         └── video.mp4
   ```

3. **Verify File Properties**:
   - File exists and is accessible
   - Correct MIME type
   - Proper file size
   - Metadata includes user information

---

## 🧪 **Test Scenarios**

### **Scenario 1: New User Journey**
1. Sign up as new user
2. Upload first photo using "Take Photo"
3. Add description and tags
4. Verify file appears in recent uploads
5. Check Firestore for user and memory documents

### **Scenario 2: Plan Limitations**
1. Create free tier user
2. Try uploading large file (>10MB) - should fail
3. Try uploading video - should show upgrade prompt
4. Upload valid image (<10MB) - should succeed

### **Scenario 3: Multiple Uploads**
1. Select multiple files from gallery
2. Upload in sequence
3. Verify all files appear in recent uploads
4. Check Firestore for all memory documents

### **Scenario 4: Error Handling**
1. Try uploading without internet connection
2. Upload corrupted file
3. Verify error messages are user-friendly
4. Test upload cancellation

---

## 🚨 **Common Issues & Solutions**

### **Upload Fails**
- ✅ Check Firebase Storage rules are configured
- ✅ Verify environment variables in `.env.local`
- ✅ Ensure user is authenticated
- ✅ Check browser console for errors

### **Files Don't Appear**
- ✅ Check Firestore security rules
- ✅ Verify user permissions
- ✅ Check network connectivity
- ✅ Look for JavaScript errors

### **Progress Not Updating**
- ✅ Check upload service implementation
- ✅ Verify progress callback functions
- ✅ Test with smaller files first

### **Plan Restrictions Not Working**
- ✅ Check user plan data in Firestore
- ✅ Verify validation logic in upload service
- ✅ Test with different user plans

---

## 📊 **Expected Results**

### **Successful Upload Should**:
1. ✅ Show progress from 0% to 100%
2. ✅ Create document in Firestore `users/{uid}/memories/`
3. ✅ Store file in Firebase Storage `users/{uid}/memories/`
4. ✅ Display success message
5. ✅ Update recent uploads list
6. ✅ File is accessible via download URL

### **Failed Upload Should**:
1. ❌ Show clear error message
2. ❌ Reset upload UI state
3. ❌ Not create incomplete Firestore documents
4. ❌ Not leave orphaned files in Storage

---

## 🔧 **Debug Tools**

### **Browser Console**
- Check for JavaScript errors
- Monitor network requests
- Watch Firebase SDK logs

### **Firebase Console**
- **Authentication**: Verify user sessions
- **Firestore**: Check document creation
- **Storage**: Verify file uploads
- **Functions**: Monitor Cloud Function logs

### **Network Tab**
- Monitor upload requests
- Check request/response headers
- Verify file upload progress

---

## 🎯 **Testing Priority**

### **High Priority**
1. ✅ Basic file upload works
2. ✅ Files appear in Firebase Storage
3. ✅ Metadata saves to Firestore
4. ✅ Progress tracking functions

### **Medium Priority**
1. ✅ Plan-based restrictions work
2. ✅ Error handling is robust
3. ✅ UI feedback is clear
4. ✅ Recent uploads display

### **Low Priority**
1. ✅ Advanced features (compression, batch upload)
2. ✅ Admin dashboard integration
3. ✅ Performance optimization
4. ✅ Additional file types

---

## 🚀 **Ready to Test!**

Your Memory Box platform is now ready for comprehensive testing. Start with the basic upload flow and gradually test more advanced features.

**Happy Testing! 🎉**
