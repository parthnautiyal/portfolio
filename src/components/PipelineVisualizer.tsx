import { useState } from 'react'
import { FiCheckCircle, FiGitCommit, FiFileText, FiLayers, FiCpu } from 'react-icons/fi'

type Stage = {
  id: string
  name: string
  icon: any
  description: string
  status: 'success' | 'checking'
  configTitle: string
  configContent: string
}

const pipelineStages: Stage[] = [
  {
    id: 'git-commit',
    name: 'Git Trigger',
    icon: FiGitCommit,
    description: 'Webhook triggers build on Git branch merge to main. Verifies commit signatures.',
    status: 'success',
    configTitle: 'GitHub Actions workflow configuration (.github/workflows/deploy.yml)',
    configContent: `name: Production Build & Deploy
on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Setup Java JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven`
  },
  {
    id: 'junit-tdd',
    name: 'TDD Test Runner',
    icon: FiCheckCircle,
    description: 'Runs Maven test suite compiling unit tests. Verifies TDD code coverage requirements.',
    status: 'success',
    configTitle: 'Surefire Test Report & TDD coverage metrics',
    configContent: `[INFO] --- maven-surefire-plugin:3.0.0:test (default-test) ---
[INFO] Running com.zopsmart.orders.OrderServiceTest
[INFO] Tests run: 147, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 14.281 s
[INFO] 
[INFO] Results:
[INFO] Tests run: 147, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] --- jacoco-maven-plugin:0.8.8:report (post-test) ---
[INFO] Analysing class files: Line Coverage: 87.2%, Branch Coverage: 84.5%
[INFO] Quality Gate Result: PASSED (Coverage >= 85.0%)`
  },
  {
    id: 'sonarqube',
    name: 'SonarQube Quality Gate',
    icon: FiFileText,
    description: 'Statics analysis scan checking for security violations, secrets leaks, and code smells.',
    status: 'success',
    configTitle: 'SonarQube Analysis Report Summary',
    configContent: `INFO: Sensor JavaSecuritySensor [security]
INFO: Sensor JavaSecuritySensor [security] done: 1205 ms
INFO: ------------- Analysing Quality Gate -------------
INFO: Quality Gate status: PASSED
INFO: 
INFO: Breakdown:
INFO: - Reliability: A (0 Bugs)
INFO: - Security: A (0 Vulnerabilities)
INFO: - Security Hotspots: 0 Review Required
INFO: - Maintainability: A (4 Code Smells, Technical Debt: 1h 20m)
INFO: - Duplicated Lines: 0.0%`
  },
  {
    id: 'docker-pack',
    name: 'Docker Build',
    icon: FiLayers,
    description: 'Compiles lightweight OCI jar container. Optimizes layers utilizing multi-stage builder.',
    status: 'success',
    configTitle: 'JVM Microservice optimized multi-stage Dockerfile',
    configContent: `# Stage 1: Runtime extraction layer
FROM eclipse-temurin:17-jre-alpine AS builder
WORKDIR /application
ARG JAR_FILE=target/*.jar
COPY \${JAR_FILE} app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 2: Final runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /application
COPY --from=builder /application/dependencies/ ./
COPY --from=builder /application/spring-boot-loader/ ./
COPY --from=builder /application/snapshot-dependencies/ ./
COPY --from=builder /application/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]`
  },
  {
    id: 'k8s-helm',
    name: 'K8s Helm Deploy',
    icon: FiCpu,
    description: 'Updates GitOps repository triggers. ArgoCD deploys Helm charts to Kubernetes cluster.',
    status: 'success',
    configTitle: 'Kubernetes resources templates configuration values (helm/values.yaml)',
    configContent: `replicaCount: 3

image:
  repository: registry.zopsmart.com/orders-service
  tag: "git-8af1a392"
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 200m
    memory: 256Mi

livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5`
  }
]

export default function PipelineVisualizer() {
  const [activeStage, setActiveStage] = useState<Stage>(pipelineStages[1]) // Default to testing report

  return (
    <div className="glass-card p-5 space-y-6">
      <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <FiCheckCircle className="text-green-500" />
          GitOps CI/CD Pipeline Visualizer
        </h3>
        <p className="text-[0.65rem] text-slate-500 mt-0.5">
          Select any pipeline node to inspect real deployment configs, build logs, and test verification scripts.
        </p>
      </div>

      {/* Horizontal Pipeline flow */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 glass-panel rounded-2xl relative overflow-hidden">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon
          const isActive = activeStage.id === stage.id
          return (
            <div key={stage.id} className="flex-1 flex flex-col md:flex-row items-center w-full relative z-10">
              <button
                onClick={() => setActiveStage(stage)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-blue-600/10 border-blue-500 text-blue-500 scale-105'
                    : 'bg-slate-900/10 border-[var(--border-color)] hover:border-slate-400 dark:hover:border-slate-600 text-[var(--color-text)]'
                } cursor-pointer`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-blue-600/20 text-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wide block">Stage 0{idx + 1}</span>
                  <span className="text-xs font-bold block text-[var(--color-text-bright)] mt-0.5 truncate">{stage.name}</span>
                </div>
              </button>
              
              {/* Connector line for large screens */}
              {idx < pipelineStages.length - 1 && (
                <div className="hidden md:block w-6 h-0.5 bg-slate-200 dark:bg-slate-800 shrink-0 self-center mx-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* Code Inspector */}
      <div className="glass-panel p-4 rounded-xl space-y-3 relative z-10">
        <div className="flex items-center justify-between text-[0.65rem] border-b border-slate-200/20 dark:border-slate-800/40 pb-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">File: {activeStage.configTitle}</span>
          <span className="font-extrabold text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded-full">Success</span>
        </div>
        <pre className="p-4 rounded-lg bg-slate-950 text-green-400 text-[0.6rem] font-mono overflow-x-auto overflow-y-auto leading-relaxed max-h-[220px] w-full border border-slate-800">
          {activeStage.configContent}
        </pre>
      </div>
    </div>
  )
}
