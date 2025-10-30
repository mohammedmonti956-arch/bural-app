#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  إكمال الميزات التالية في تطبيق Boral:
  1. زر الطلب للمنتجات يؤدي إلى المراسلة مع صاحب المتجر
  2. تعديلات المنتجات والأسعار والحذف
  3. وصول الخريطة للموقع الجغرافي للمستخدم مباشرة
  4. السماح برفع أكثر من صورة لنفس المنتج مع جعل مقاييس الصور قياسية
  5. مسح وإلغاء جميع المتاجر التي تم تسجيل الدخول فيها ببريد إلكتروني
  6. إصلاح الأخطاء في الإعجاب بالمنتج
  7. إضافة صور الملف الشخصي لكل صاحب متجر
  8. تحديد موقع المتجر للمستخدم في صفحة المتجر أو تحت كل منتج

backend:
  - task: "Order button messaging integration"
    implemented: true
    working: "needs_testing"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Feature was mentioned as recently implemented, needs verification"

  - task: "Multiple images per product - backend model"
    implemented: false
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Need to update Product model from single 'image' to 'images: List[str]'"

  - task: "Delete all stores by email endpoint"
    implemented: false
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Need new DELETE endpoint to remove all stores for authenticated user"

  - task: "Profile picture upload endpoint"
    implemented: false
    working: "NA"
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "User model has avatar field but need upload endpoint"

  - task: "Product like/unlike functionality"
    implemented: true
    working: "needs_testing"
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Endpoints exist at lines 458 and 478, user reported bugs need verification"

frontend:
  - task: "Product edit/delete UI in ManageProducts"
    implemented: false
    working: "NA"
    file: "ManageProducts.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Need UI to edit product details, pricing, and delete products"

  - task: "Multiple images upload UI for products"
    implemented: false
    working: "NA"
    file: "ManageProducts.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Need to support multiple image upload with standard sizing"

  - task: "Map geolocation auto-focus"
    implemented: false
    working: "NA"
    file: "MapView.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Map should detect and zoom to user's current location on load"

  - task: "Store location display in StoreDetails"
    implemented: false
    working: "NA"
    file: "StoreDetails.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Add small map widget showing store location"

  - task: "Profile picture upload UI"
    implemented: false
    working: "NA"
    file: "Profile.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Add UI to upload and display user avatar"

  - task: "Delete all stores button"
    implemented: false
    working: "NA"
    file: "Profile.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Add button in profile to delete all user's stores"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Multiple images per product - backend model"
    - "Product edit/delete UI in ManageProducts"
    - "Map geolocation auto-focus"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Starting implementation of all requested features. Will implement in phases: 1) Backend model updates, 2) Product management, 3) Map enhancements, 4) Profile features, 5) Admin features, 6) Bug fixes. Starting with backend updates for multiple images support."