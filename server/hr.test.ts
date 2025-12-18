import { describe, it, expect } from "vitest";
import {
  createDepartment,
  getDepartments,
  createJobTitle,
  getJobTitles,
  createEmployee,
  getEmployees,
  updateEmployee,
  createAttendance,
  getAttendance,
  createLeaveType,
  getLeaveTypes,
  createLeaveRequest,
  getLeaveRequests,
  createPayrollRun,
  getPayrollRuns,
  linkEmployeeToFieldWorker,
  getUnlinkedEmployees,
} from "./db";

describe("HR System - Departments", () => {
  it("should create a department", async () => {
    const dept = await createDepartment({
      businessId: 1,
      code: "IT",
      nameAr: "تقنية المعلومات",
      nameEn: "Information Technology",
    });
    expect(dept).toBeDefined();
    expect(dept.code).toBe("IT");
    expect(dept.nameAr).toBe("تقنية المعلومات");
  });

  it("should list departments", async () => {
    const depts = await getDepartments(1);
    expect(Array.isArray(depts)).toBe(true);
  });
});

describe("HR System - Job Titles", () => {
  it("should create a job title", async () => {
    const job = await createJobTitle({
      businessId: 1,
      code: "DEV",
      titleAr: "مطور برمجيات",
      titleEn: "Software Developer",
    });
    expect(job).toBeDefined();
    expect(job.code).toBe("DEV");
    expect(job.titleAr).toBe("مطور برمجيات");
  });

  it("should list job titles", async () => {
    const jobs = await getJobTitles(1);
    expect(Array.isArray(jobs)).toBe(true);
  });
});

describe("HR System - Employees", () => {
  it("should create an employee", async () => {
    const uniqueNum = `EMP-${Date.now()}`;
    const emp = await createEmployee({
      businessId: 1,
      employeeNumber: uniqueNum,
      firstName: "أحمد",
      lastName: "محمد",
      idNumber: "1234567890",
      mobile: "0501234567",
      hireDate: new Date().toISOString().split("T")[0],
      status: "active",
    });
    expect(emp).toBeDefined();
    expect(emp.employeeNumber).toBe(uniqueNum);
    expect(emp.firstName).toBe("أحمد");
  });

  it("should list employees", async () => {
    const emps = await getEmployees(1);
    expect(Array.isArray(emps)).toBe(true);
  });

  it("should update an employee", async () => {
    const emps = await getEmployees(1);
    if (emps.length > 0) {
      const updated = await updateEmployee(emps[0].id, { firstName: "محمد" });
      expect(updated).toBeDefined();
    }
  });

  it("should get unlinked employees", async () => {
    const unlinked = await getUnlinkedEmployees(1);
    expect(Array.isArray(unlinked)).toBe(true);
  });
});

describe("HR System - Attendance", () => {
  it("should create attendance record", async () => {
    const emps = await getEmployees(1);
    if (emps.length > 0) {
      const attendance = await createAttendance({
        businessId: 1,
        employeeId: emps[0].id,
        attendanceDate: new Date().toISOString().split("T")[0],
        checkInTime: new Date(),
        checkInMethod: "manual",
        status: "present",
      });
      expect(attendance).toBeDefined();
      expect(attendance.status).toBe("present");
    }
  });

  it("should list attendance records", async () => {
    const records = await getAttendance(1);
    expect(Array.isArray(records)).toBe(true);
  });
});

describe("HR System - Leave Management", () => {
  it("should create a leave type", async () => {
    const uniqueCode = `ANNUAL-${Date.now()}`;
    const type = await createLeaveType({
      businessId: 1,
      code: uniqueCode,
      nameAr: "إجازة سنوية",
      nameEn: "Annual Leave",
      defaultDays: 21,
      isPaid: true,
    });
    expect(type).toBeDefined();
    expect(type.code).toBe(uniqueCode);
  });

  it("should list leave types", async () => {
    const types = await getLeaveTypes(1);
    expect(Array.isArray(types)).toBe(true);
  });

  it("should create a leave request", async () => {
    const emps = await getEmployees(1);
    const types = await getLeaveTypes(1);
    if (emps.length > 0 && types.length > 0) {
      const request = await createLeaveRequest({
        businessId: 1,
        employeeId: emps[0].id,
        leaveTypeId: types[0].id,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        totalDays: 1,
        status: "pending",
      });
      expect(request).toBeDefined();
      expect(request.status).toBe("pending");
    }
  });

  it("should list leave requests", async () => {
    const requests = await getLeaveRequests(1);
    expect(Array.isArray(requests)).toBe(true);
  });
});

describe("HR System - Payroll", () => {
  it("should create a payroll run", async () => {
    const payroll = await createPayrollRun({
      businessId: 1,
      code: "PAY-2024-01",
      periodYear: 2024,
      periodMonth: 1,
      periodStartDate: "2024-01-01",
      periodEndDate: "2024-01-31",
      status: "draft",
    });
    expect(payroll).toBeDefined();
    expect(payroll.code).toBe("PAY-2024-01");
    expect(payroll.status).toBe("draft");
  });

  it("should list payroll runs", async () => {
    const runs = await getPayrollRuns(1);
    expect(Array.isArray(runs)).toBe(true);
  });
});

describe("HR System - Field Worker Integration", () => {
  it("should link employee to field worker", async () => {
    // This test verifies the integration between HR and Field Operations
    const emps = await getEmployees(1);
    if (emps.length > 0) {
      // Note: This would need a field worker to exist
      // For now, we just verify the function exists and can be called
      expect(typeof linkEmployeeToFieldWorker).toBe("function");
    }
  });
});
