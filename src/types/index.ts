export interface ClassItem {
    id: string;
    name: string;
    type: "Offline" | "Online";
}

export interface SubjectItem {
    id: string;
    name: string;
    class_id: string;
    class?: { name: string; type?: string };
}

export interface StudentItem {
    id: string;
    first_name: string;
    usn: string;
    class_id?: string;
    className?: string; // For student portal
    classType?: "Offline" | "Online"; // For redirection logic
    class?: { name: string; type: "Offline" | "Online" }; // For admin portal
    marks?: MarkItem[];
    attendance?: AttendanceRecord[];
    updatedAt?: string;
}

export interface MarkItem {
    id?: string;
    student_id?: string;
    subject_id?: string;
    subject?: string | { name: string }; // String for portal, object for admin
    total: number;
    grade?: string;
    term?: string;
    student?: { first_name: string; usn: string };
}

export interface AttendanceRecord {
    date: string;
    status: "Present" | "Absent";
}
