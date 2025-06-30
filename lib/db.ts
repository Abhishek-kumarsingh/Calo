// Database utility functions to replace Prisma
import mongoose from 'mongoose';

// Define types for our models
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string | null;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  domain: string;
  subDomain: string;
  level: string;
  status: string;
  score?: number | null;
  overallFeedback?: string | null;
  userId: string;
  questions: Array<{
    question: string;
    answer: string;
    feedback: string;
  }>;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  department?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  content: string;
  type: string;
  options?: string | null;
  correctAnswer?: string | null;
  domain: string;
  subDomain?: string | null;
  difficulty: string;
  interviewId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  role: string;
  interviewId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database for development
class MockDatabase {
  private interviews: Interview[] = [];
  private questions: Question[] = [];
  private messages: Message[] = [];
  private users: User[] = [
    {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  private candidates: Candidate[] = [];

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample AI interview
    const sampleAIInterview: Interview = {
      id: "ai-interview-1",
      domain: "frontend",
      subDomain: "React",
      level: "intermediate",
      status: "in_progress",
      score: null,
      overallFeedback: null,
      userId: "admin-1",
      questions: [
        {
          question: "Explain the concept of virtual DOM in React and how it improves performance.",
          answer: "",
          feedback: ""
        },
        {
          question: "What are React hooks? Explain useState and useEffect with examples.",
          answer: "",
          feedback: ""
        },
        {
          question: "Describe the component lifecycle in React and how it differs between class and functional components.",
          answer: "",
          feedback: ""
        },
        {
          question: "What is the purpose of React Context API? When would you use it instead of prop drilling?",
          answer: "",
          feedback: ""
        },
        {
          question: "Explain how you would optimize a React application for better performance.",
          answer: "",
          feedback: ""
        }
      ],
      createdAt: new Date().toISOString()
    };
    this.interviews.push(sampleAIInterview);

    // Add a completed AI interview
    const completedAIInterview: Interview = {
      id: "ai-interview-2",
      domain: "backend",
      subDomain: "Node.js",
      level: "advanced",
      status: "completed",
      score: 85,
      overallFeedback: "You demonstrated strong knowledge of Node.js concepts and backend architecture. Your understanding of asynchronous programming and event-driven architecture is excellent. There's room for improvement in database optimization techniques and security best practices. Overall, a strong performance that shows your expertise in backend development.",
      userId: "admin-1",
      questions: [
        {
          question: "Explain the event loop in Node.js and how it enables non-blocking I/O operations.",
          answer: "The event loop is a core concept in Node.js that allows it to perform non-blocking I/O operations despite JavaScript being single-threaded. It works by offloading operations to the system kernel whenever possible and using a callback mechanism to handle the results when they're ready.\n\nWhen Node.js starts, it initializes the event loop, processes the provided input script, and then begins processing the event loop. The event loop has multiple phases, including timers, pending callbacks, idle/prepare, poll, check, and close callbacks. Each phase has a FIFO queue of callbacks to execute.\n\nFor example, when making a database query, Node.js doesn't wait for the response. It registers a callback and continues executing other code. When the database response is ready, the callback is added to the event loop queue and executed when the loop reaches it. This allows Node.js to handle thousands of concurrent connections without creating a new thread for each one, making it memory-efficient and scalable.",
          feedback: "Excellent explanation! You've demonstrated a deep understanding of the event loop in Node.js. Your explanation covers the key concepts of non-blocking I/O, the callback mechanism, and the phases of the event loop. The example of a database query effectively illustrates how asynchronous operations work in practice. You've also highlighted the performance benefits of this architecture, which is a crucial advantage of Node.js."
        },
        {
          question: "Describe the differences between REST and GraphQL APIs. When would you choose one over the other?",
          answer: "REST and GraphQL are two different approaches to building APIs:\n\nREST (Representational State Transfer):\n- Uses standard HTTP methods (GET, POST, PUT, DELETE)\n- Multiple endpoints for different resources\n- Fixed data structure returned from each endpoint\n- Over-fetching or under-fetching of data is common\n- Easier caching due to HTTP standards\n- Widely adopted with good tooling\n\nGraphQL:\n- Single endpoint for all operations\n- Client specifies exactly what data it needs\n- Eliminates over-fetching and under-fetching\n- Strongly typed schema that serves as documentation\n- More complex to set up initially\n- Requires more client-side processing\n\nI would choose REST when:\n- The API has simple, well-defined resource types\n- Caching is important for performance\n- The client needs are predictable and stable\n- Working with simple CRUD operations\n\nI would choose GraphQL when:\n- The client needs vary widely or change frequently\n- The data is highly relational\n- Network performance is critical (mobile apps)\n- The API serves multiple client platforms with different data needs\n- Rapid development and iteration is important",
          feedback: "Very comprehensive comparison! You've clearly outlined the key differences between REST and GraphQL APIs and provided thoughtful criteria for choosing between them. Your explanation shows a nuanced understanding of the trade-offs involved. The structured format makes your answer easy to follow. You've demonstrated excellent knowledge of modern API design principles."
        },
        {
          question: "How would you handle authentication and authorization in a Node.js application? Discuss security best practices.",
          answer: "For a Node.js application, I would implement authentication and authorization as follows:\n\nAuthentication (verifying identity):\n- Use JWT (JSON Web Tokens) for stateless authentication\n- Implement OAuth2 for third-party authentication when needed\n- Store passwords using bcrypt with appropriate salt rounds\n- Use HTTPS for all communications\n- Implement rate limiting to prevent brute force attacks\n\nAuthorization (controlling access):\n- Role-based access control (RBAC) for different permission levels\n- Middleware to check permissions before handling requests\n- Principle of least privilege - grant only necessary permissions\n\nSecurity best practices:\n- Input validation using libraries like Joi or express-validator\n- Parameterized queries to prevent SQL injection\n- Set proper HTTP headers (Content-Security-Policy, X-XSS-Protection)\n- Use helmet.js to set security-related headers automatically\n- Implement CORS properly to restrict access from unauthorized domains\n- Regular dependency updates to patch vulnerabilities (npm audit)\n- Error handling that doesn't expose sensitive information\n- Use environment variables for sensitive configuration\n- Implement proper logging for security events\n- Regular security audits and penetration testing",
          feedback: "Your answer demonstrates strong knowledge of security practices in Node.js applications. You've covered the essential aspects of both authentication and authorization with specific technologies and approaches. I particularly appreciate your mention of bcrypt for password hashing, JWT for authentication, and the principle of least privilege for authorization. Your security best practices section is comprehensive and shows awareness of common vulnerabilities and their mitigations. One area you might consider adding is session management strategies and CSRF protection, but overall this is an excellent response."
        },
        {
          question: "Explain database indexing and how it affects query performance. Give examples of when you would and wouldn't create an index.",
          answer: "Database indexing is a data structure technique that improves the speed of data retrieval operations by creating pointers to data locations, similar to how a book index helps you find information quickly.\n\nHow indexing works:\n- Creates a separate data structure (typically B-tree or hash) that points to records\n- Allows the database to find data without scanning the entire table\n- Takes additional storage space and adds overhead to write operations\n\nHow it affects performance:\n- Dramatically speeds up SELECT queries with WHERE, JOIN, and ORDER BY clauses\n- Slows down INSERT, UPDATE, and DELETE operations as indexes need updating\n- Consumes additional disk space and memory\n\nWhen to create indexes:\n- On columns frequently used in WHERE clauses\n- On columns used in JOIN operations (foreign keys)\n- On columns used in ORDER BY or GROUP BY\n- On large tables where query performance is critical\n- On columns with high cardinality (many unique values)\n\nWhen not to create indexes:\n- On small tables where full table scans are already fast\n- On columns rarely used in queries\n- On columns with low cardinality (few unique values)\n- On columns that are frequently updated\n- When write performance is more critical than read performance\n- When disk space is a significant constraint",
          feedback: "Your explanation of database indexing is thorough and well-structured. You've clearly explained the concept, how it works, and its impact on performance. Your lists of when to create and when not to create indexes show a practical understanding of the trade-offs involved. The mention of cardinality as a factor in indexing decisions demonstrates advanced knowledge. This is a strong answer that shows both theoretical understanding and practical experience with database optimization."
        },
        {
          question: "Describe how you would design a scalable microservices architecture using Node.js. Include considerations for service discovery, communication, and deployment.",
          answer: "When designing a scalable microservices architecture with Node.js, I would consider the following aspects:\n\nService Design:\n- Single responsibility principle - each service handles one business capability\n- Domain-driven design to define service boundaries\n- Stateless services where possible to facilitate scaling\n- Asynchronous processing using event queues for long-running tasks\n- Circuit breakers to handle service failures gracefully\n\nService Discovery:\n- Use a service registry like Consul or etcd\n- Implement health checks for each service\n- Consider client-side discovery or server-side discovery patterns\n- Use DNS-based discovery for simpler setups\n\nCommunication:\n- REST APIs for synchronous request/response patterns\n- gRPC for efficient internal service communication\n- Message queues (RabbitMQ, Kafka) for asynchronous communication\n- Event-driven architecture for decoupling services\n- API Gateway for external clients (using Express or Fastify)\n\nData Management:\n- Database per service when possible\n- Consider eventual consistency for distributed data\n- Implement the CQRS pattern for complex domains\n- Use saga pattern for distributed transactions\n\nDeployment and Scaling:\n- Containerization with Docker\n- Orchestration with Kubernetes\n- CI/CD pipelines for automated testing and deployment\n- Blue-green or canary deployment strategies\n- Horizontal scaling based on load metrics\n\nMonitoring and Observability:\n- Distributed tracing with Jaeger or Zipkin\n- Centralized logging with ELK stack\n- Metrics collection with Prometheus\n- Alerting system for critical issues\n\nSecurity:\n- API authentication with JWT or OAuth2\n- Service-to-service authentication\n- Rate limiting and throttling\n- Network security policies\n\nNode.js Specific Considerations:\n- Use clustering to take advantage of multiple CPU cores\n- Implement proper error handling and process management\n- Consider TypeScript for type safety in large codebases\n- Use PM2 or similar for process management in production",
          feedback: "This is an outstanding answer that demonstrates expert-level knowledge of microservices architecture. You've covered all the critical aspects of designing a scalable system, from service design principles to deployment strategies. Your answer shows a deep understanding of both theoretical concepts and practical implementation details. The Node.js-specific considerations show your expertise with the platform. Your mention of advanced patterns like CQRS, saga, and circuit breakers indicates experience with complex distributed systems. This comprehensive response would satisfy even the most demanding technical interview."
        }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    };
    this.interviews.push(completedAIInterview);

    // Add a sample candidate
    const sampleCandidate: Candidate = {
      id: "sample-candidate-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      role: "Frontend Developer",
      department: "Engineering",
      userId: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.candidates.push(sampleCandidate);

    // Add a sample interview
    const sampleInterview: Interview = {
      id: "sample-interview-1",
      title: "Frontend Developer Interview",
      description: "Technical interview for frontend position",
      date: new Date(Date.now() + 86400000), // Tomorrow
      duration: 60,
      status: "scheduled",
      type: "technical",
      domain: "frontend",
      subDomain: "react",
      difficulty: "intermediate",
      score: null,
      feedback: null,
      userId: "admin-1",
      candidateId: sampleCandidate.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.interviews.push(sampleInterview);

    // Add a welcome message
    const welcomeMessage: Message = {
      id: "sample-message-1",
      content: "Welcome to your interview! I'm your AI interviewer today. We'll be discussing your experience and skills. Let's start with a brief introduction about yourself and your background.",
      role: "system",
      interviewId: sampleInterview.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.messages.push(welcomeMessage);

    // Add sample questions
    const sampleQuestions: Question[] = [
      {
        id: "sample-question-1",
        content: "Explain the difference between React's functional components and class components.",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "frontend",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: sampleInterview.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "sample-question-2",
        content: "What is the virtual DOM in React and how does it work?",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "frontend",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: sampleInterview.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "sample-question-3",
        content: "Which of the following is NOT a React hook?",
        type: "multiple-choice",
        options: JSON.stringify(["useState", "useEffect", "useHistory", "useCallback"]),
        correctAnswer: "useHistory",
        domain: "frontend",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: sampleInterview.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.questions.push(...sampleQuestions);

    // Add a second sample candidate
    const backendCandidate: Candidate = {
      id: "sample-candidate-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "555-987-6543",
      role: "Backend Developer",
      department: "Engineering",
      userId: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.candidates.push(backendCandidate);

    // Add a second sample interview
    const backendInterview: Interview = {
      id: "sample-interview-2",
      title: "Backend Developer Interview",
      description: "Technical interview for backend position",
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      duration: 45,
      status: "scheduled",
      type: "technical",
      domain: "backend",
      subDomain: "nodejs",
      difficulty: "advanced",
      score: null,
      feedback: null,
      userId: "admin-1",
      candidateId: backendCandidate.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.interviews.push(backendInterview);

    // Add welcome message for backend interview
    const backendWelcomeMessage: Message = {
      id: "sample-message-2",
      content: "Welcome to your backend developer interview! I'll be asking you questions about Node.js, databases, and server architecture. Let's begin with your background in backend development.",
      role: "system",
      interviewId: backendInterview.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.messages.push(backendWelcomeMessage);

    // Add backend sample questions
    const backendQuestions: Question[] = [
      {
        id: "sample-question-4",
        content: "Explain the event loop in Node.js and how it enables non-blocking I/O operations.",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "backend",
        subDomain: "nodejs",
        difficulty: "advanced",
        interviewId: backendInterview.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "sample-question-5",
        content: "What are the differences between SQL and NoSQL databases? When would you choose one over the other?",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "backend",
        subDomain: "databases",
        difficulty: "advanced",
        interviewId: backendInterview.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.questions.push(...backendQuestions);

    // Add a completed interview
    const completedCandidate: Candidate = {
      id: "sample-candidate-3",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "555-456-7890",
      role: "Full Stack Developer",
      department: "Product",
      userId: "admin-1",
      createdAt: new Date(Date.now() - 604800000), // 1 week ago
      updatedAt: new Date(Date.now() - 604800000)
    };
    this.candidates.push(completedCandidate);

    const completedInterview: Interview = {
      id: "sample-interview-3",
      title: "Full Stack Developer Interview",
      description: "Technical interview for full stack position",
      date: new Date(Date.now() - 432000000), // 5 days ago
      duration: 60,
      status: "completed",
      type: "technical",
      domain: "fullstack",
      subDomain: "javascript",
      difficulty: "intermediate",
      score: 85,
      feedback: "Alex demonstrated strong knowledge of both frontend and backend technologies. Their React skills are excellent, and they have a good understanding of Node.js and Express. They could improve on database optimization techniques and advanced state management patterns. Overall, a strong candidate who would be a valuable addition to the team.",
      userId: "admin-1",
      candidateId: completedCandidate.id,
      createdAt: new Date(Date.now() - 604800000),
      updatedAt: new Date(Date.now() - 432000000)
    };
    this.interviews.push(completedInterview);

    // Add messages for the completed interview
    const completedMessages: Message[] = [
      {
        id: "sample-message-3",
        content: "Welcome to your full stack developer interview! I'll be asking you questions about both frontend and backend technologies. Let's start with your experience in full stack development.",
        role: "system",
        interviewId: completedInterview.id,
        createdAt: new Date(Date.now() - 432000000),
        updatedAt: new Date(Date.now() - 432000000)
      },
      {
        id: "sample-message-4",
        content: "I've been working as a full stack developer for about 3 years now. I primarily use React for frontend and Node.js with Express for backend. I'm also familiar with MongoDB and PostgreSQL for databases.",
        role: "user",
        interviewId: completedInterview.id,
        createdAt: new Date(Date.now() - 431900000),
        updatedAt: new Date(Date.now() - 431900000)
      },
      {
        id: "sample-message-5",
        content: "That's a good mix of technologies. Can you tell me about a challenging project you worked on recently and how you approached it?",
        role: "assistant",
        interviewId: completedInterview.id,
        createdAt: new Date(Date.now() - 431800000),
        updatedAt: new Date(Date.now() - 431800000)
      }
    ];
    this.messages.push(...completedMessages);

    // Add questions for the completed interview
    const completedQuestions: Question[] = [
      {
        id: "sample-question-6",
        content: "Explain how React's Context API works and when you would use it instead of Redux.",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "fullstack",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: completedInterview.id,
        createdAt: new Date(Date.now() - 604800000),
        updatedAt: new Date(Date.now() - 604800000)
      },
      {
        id: "sample-question-7",
        content: "Describe your approach to handling authentication in a full stack application.",
        type: "text",
        options: null,
        correctAnswer: null,
        domain: "fullstack",
        subDomain: "security",
        difficulty: "intermediate",
        interviewId: completedInterview.id,
        createdAt: new Date(Date.now() - 604800000),
        updatedAt: new Date(Date.now() - 604800000)
      }
    ];
    this.questions.push(...completedQuestions);

    console.log("Sample data initialized with interview IDs:", sampleInterview.id, backendInterview.id, completedInterview.id);
  }

  // Interview methods
  async findInterviewById(id: string): Promise<Interview | null> {
    console.log(`Finding interview with ID: ${id}`);
    console.log(`Available interviews: ${this.interviews.map(i => i.id).join(', ')}`);
    const interview = this.interviews.find(interview => interview.id === id) || null;
    console.log(`Found interview: ${interview ? JSON.stringify(interview) : 'null'}`);
    return interview;
  }

  async findInterviewsByUserId(userId: string): Promise<Interview[]> {
    return this.interviews.filter(interview => interview.userId === userId);
  }

  async findInterviews(filters: {
    userId?: string;
    domain?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    limit?: number;
  }): Promise<Interview[]> {
    let filteredInterviews = this.interviews;

    // Apply filters
    if (filters.userId) {
      filteredInterviews = filteredInterviews.filter(interview => interview.userId === filters.userId);
    }

    if (filters.domain) {
      filteredInterviews = filteredInterviews.filter(interview => interview.domain === filters.domain);
    }

    if (filters.status) {
      filteredInterviews = filteredInterviews.filter(interview => interview.status === filters.status);
    }

    if (filters.startDate) {
      filteredInterviews = filteredInterviews.filter(interview => {
        const interviewDate = new Date(interview.createdAt);
        return interviewDate >= filters.startDate!;
      });
    }

    if (filters.endDate) {
      filteredInterviews = filteredInterviews.filter(interview => {
        const interviewDate = new Date(interview.createdAt);
        return interviewDate <= filters.endDate!;
      });
    }

    // Apply limit if specified
    if (filters.limit && filters.limit > 0) {
      filteredInterviews = filteredInterviews.slice(0, filters.limit);
    }

    return filteredInterviews;
  }

  async createInterview(data: Partial<Interview>): Promise<Interview> {
    const newInterview: Interview = {
      ...data,
      id: data.id || Date.now().toString(),
      domain: data.domain || 'frontend',
      subDomain: data.subDomain || 'react',
      level: data.level || 'intermediate',
      status: data.status || 'in_progress',
      score: data.score || null,
      overallFeedback: data.overallFeedback || null,
      userId: data.userId || 'admin-1',
      questions: data.questions || [],
      createdAt: data.createdAt || new Date().toISOString()
    };

    console.log(`Creating new interview: ${JSON.stringify(newInterview)}`);

    // If an interview with this ID already exists, update it instead
    const existingIndex = this.interviews.findIndex(i => i.id === newInterview.id);
    if (existingIndex !== -1) {
      console.log(`Interview with ID ${newInterview.id} already exists, updating it`);
      this.interviews[existingIndex] = newInterview;
    } else {
      this.interviews.push(newInterview);
    }

    return newInterview;
  }

  async updateInterview(id: string, data: Partial<Interview>): Promise<Interview | null> {
    const index = this.interviews.findIndex(interview => interview.id === id);
    if (index === -1) return null;

    // Update the interview with the new data
    this.interviews[index] = {
      ...this.interviews[index],
      ...data,
      updatedAt: new Date()
    };

    console.log(`Updated interview ${id} with data:`, data);
    return this.interviews[index];
  }

  async deleteInterview(id: string): Promise<boolean> {
    console.log(`Attempting to delete interview with ID: ${id}`);
    const initialLength = this.interviews.length;
    this.interviews = this.interviews.filter(interview => interview.id !== id);
    const deleted = this.interviews.length < initialLength;

    console.log(`Interview deletion result: ${deleted ? 'Success' : 'Not found'}`);
    return deleted;
  }

  async deleteMessagesByInterviewId(interviewId: string): Promise<number> {
    console.log(`Attempting to delete messages for interview with ID: ${interviewId}`);
    const initialLength = this.messages.length;
    this.messages = this.messages.filter(message => message.interviewId !== interviewId);
    const deletedCount = initialLength - this.messages.length;

    console.log(`Deleted ${deletedCount} messages for interview ${interviewId}`);
    return deletedCount;
  }

  async deleteQuestionsByInterviewId(interviewId: string): Promise<number> {
    console.log(`Attempting to delete questions for interview with ID: ${interviewId}`);
    const initialLength = this.questions.length;
    this.questions = this.questions.filter(question => question.interviewId !== interviewId);
    const deletedCount = initialLength - this.questions.length;

    console.log(`Deleted ${deletedCount} questions for interview ${interviewId}`);
    return deletedCount;
  }

  // Question methods
  async findQuestionsByInterviewId(interviewId: string): Promise<Question[]> {
    return this.questions.filter(question => question.interviewId === interviewId);
  }

  async createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const newQuestion: Question = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.questions.push(newQuestion);
    return newQuestion;
  }

  // Message methods
  async findMessagesByInterviewId(interviewId: string): Promise<Message[]> {
    return this.messages.filter(message => message.interviewId === interviewId);
  }

  async createMessage(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    const newMessage: Message = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  // Candidate methods
  async findCandidateById(id: string): Promise<Candidate | null> {
    return this.candidates.find(candidate => candidate.id === id) || null;
  }

  async createCandidate(data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
}

// Export a database instance
export const db = new MockDatabase();
