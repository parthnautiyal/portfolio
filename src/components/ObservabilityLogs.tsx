import { useState, useEffect, useRef } from 'react'
import { FiActivity, FiTerminal, FiPlay } from 'react-icons/fi'
import type { FailureState } from '../pages/SystemCockpitPage.tsx'

type Props = {
  failureState: FailureState
}

type LogLine = {
  timestamp: string
  service: string
  level: 'INFO' | 'WARN' | 'ERROR'
  traceId: string
  message: string
}

export default function ObservabilityLogs({ failureState }: Props) {
  const [logs, setLogs] = useState<LogLine[]>([
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      service: 'gateway-service',
      level: 'INFO',
      traceId: 'system-startup',
      message: 'Gateway proxy running on port 8080. Connected to discovery server.'
    },
    {
      timestamp: new Date(Date.now() - 4000).toISOString(),
      service: 'order-service',
      level: 'INFO',
      traceId: 'system-startup',
      message: 'order-service connected to PostgreSQL. Hikari database connection pool initialized.'
    },
    {
      timestamp: new Date(Date.now() - 3500).toISOString(),
      service: 'payment-service',
      level: 'INFO',
      traceId: 'system-startup',
      message: 'payment-service successfully subscribed to Kafka broker cluster.'
    }
  ])

  // Sparkline data state
  const [metrics, setMetrics] = useState({
    rps: [24, 28, 22, 25, 27, 30, 28, 26, 29, 27],
    latency: [45, 52, 48, 55, 42, 58, 49, 44, 47, 51],
    jvm: [64, 65, 68, 62, 66, 67, 69, 70, 71, 72],
    kafkaLag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  })

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Periodically generate background noise logs and update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update metric sparklines based on failures
      setMetrics((prev) => {
        const updateArray = (arr: number[], min: number, max: number, failFactor = 1) => {
          const nextVal = Math.round((min + Math.random() * (max - min)) * failFactor)
          return [...arr.slice(1), Math.max(0, nextVal)]
        }

        let rpsFactor = 1
        let latencyFactor = 1
        let jvmFactor = 1
        let lagMin = 0
        let lagMax = 2

        if (failureState.dbExhausted) {
          rpsFactor = 0.1 // TPS drops to 10%
          latencyFactor = 25 // p99 latency spikes (Hikari pool timeouts)
          jvmFactor = 1.3 // JVM threads queuing up
        }
        if (failureState.circuitBreakerTripped) {
          latencyFactor = 3 // slight latency spike before circuit trips, then stabilizes due to fast fallback
          rpsFactor = 0.8
        }
        if (failureState.kafkaDown) {
          lagMin = prev.kafkaLag[prev.kafkaLag.length - 1] + 12 // lag grows by ~12 events per tick
          lagMax = lagMin + 25
        } else {
          lagMin = 0
          lagMax = 0
        }

        return {
          rps: updateArray(prev.rps, 20, 35, rpsFactor),
          latency: updateArray(prev.latency, 40, 60, latencyFactor),
          jvm: updateArray(prev.jvm, 55, 80, jvmFactor),
          kafkaLag: updateArray(prev.kafkaLag, lagMin, lagMax)
        }
      })

      // 2. Generate health check noise logs occasionally
      if (Math.random() > 0.6) {
        const services = ['gateway-service', 'order-service', 'payment-service']
        const randomSvc = services[Math.floor(Math.random() * services.length)]
        setLogs((prev) => [
          ...prev.slice(-90), // Cap logs array size
          {
            timestamp: new Date().toISOString(),
            service: randomSvc,
            level: 'INFO',
            traceId: 'sys-health',
            message: `Actuator endpoint GET /health status: UP (threads active: ${Math.floor(Math.random() * 5) + 12})`
          }
        ])
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [failureState])

  // Sparkline SVG path generator
  const drawSparkline = (data: number[], width: number, height: number) => {
    if (data.length < 2) return ''
    const maxVal = Math.max(...data, 1)
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - (val / maxVal) * height
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  // Trigger a full transaction trace flow
  const triggerTransaction = () => {
    const id = 'tr-' + Math.random().toString(36).substring(2, 10)
    const time = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString()

    const newLogs: LogLine[] = []

    // Step 1: Gateway Request
    newLogs.push({
      timestamp: time(0),
      service: 'gateway-service',
      level: 'INFO',
      traceId: id,
      message: 'POST /api/v1/orders - payload: {"productId":"P-8821","qty":1}'
    })

    if (failureState.podCrashed) {
      newLogs.push(
        {
          timestamp: time(10),
          service: 'gateway-service',
          level: 'WARN',
          traceId: id,
          message: 'Route node order-service-7f4c9c-2 unreachable. Ingress status code: 502 Bad Gateway'
        },
        {
          timestamp: time(15),
          service: 'gateway-service',
          level: 'INFO',
          traceId: id,
          message: 'Ingress rerouting traffic to active replica: order-service-7f4c9c-1'
        }
      )
    } else {
      newLogs.push({
        timestamp: time(10),
        service: 'gateway-service',
        level: 'INFO',
        traceId: id,
        message: 'Routing request to order-service-7f4c9c-2'
      })
    }

    // Step 2: Order service database check
    newLogs.push({
      timestamp: time(50),
      service: 'order-service',
      level: 'INFO',
      traceId: id,
      message: 'Initializing order creation in database. Fetching inventory details...'
    })

    if (failureState.dbExhausted) {
      newLogs.push(
        {
          timestamp: time(100),
          service: 'order-service',
          level: 'WARN',
          traceId: id,
          message: 'HikariPool-1 - Connection is not available, request timed out after 5000ms. Active: 10, Idle: 0, Max: 10'
        },
        {
          timestamp: time(105),
          service: 'order-service',
          level: 'ERROR',
          traceId: id,
          message: 'Database transaction failed: SQLTransientConnectionException. Aborting transaction.'
        }
      )
      setLogs((prev) => [...prev, ...newLogs])
      return
    }

    // Step 3: Kafka publishing
    newLogs.push({
      timestamp: time(80),
      service: 'order-service',
      level: 'INFO',
      traceId: id,
      message: 'Persisted order in PG DB status: PENDING. Publishing event to Kafka orders-v1'
    })

    if (failureState.kafkaDown) {
      newLogs.push(
        {
          timestamp: time(180),
          service: 'order-service',
          level: 'WARN',
          traceId: id,
          message: 'Kafka partition metadata offline. Retrying broker handshake...'
        },
        {
          timestamp: time(280),
          service: 'order-service',
          level: 'ERROR',
          traceId: id,
          message: 'Failed to publish OrderCreatedEvent to orders-v1. Local memory buffer buffering events. Buffer utilization: 12%'
        }
      )
      setLogs((prev) => [...prev, ...newLogs])
      return
    }

    // Step 4: Consumer payment service
    newLogs.push({
      timestamp: time(110),
      service: 'payment-service',
      level: 'INFO',
      traceId: id,
      message: 'Consumed OrderCreatedEvent from partition orders-v1:0 (offset 11094)'
    })

    newLogs.push({
      timestamp: time(120),
      service: 'payment-service',
      level: 'INFO',
      traceId: id,
      message: 'Calling external payment gateway API (Stripe)...'
    })

    if (failureState.circuitBreakerTripped) {
      newLogs.push(
        {
          timestamp: time(220),
          service: 'payment-service',
          level: 'WARN',
          traceId: id,
          message: 'Gateway socket read timeout. Invoking local circuit breaker retry...'
        },
        {
          timestamp: time(225),
          service: 'payment-service',
          level: 'WARN',
          traceId: id,
          message: 'Resilience4j State: OPEN. Rejecting subsequent API requests with fallback.'
        },
        {
          timestamp: time(230),
          service: 'order-service',
          level: 'ERROR',
          traceId: id,
          message: 'Temporal workflow caught ActivityFailure: PaymentServiceException. Running fallback: scheduling retry after 10s cooldown.'
        }
      )
    } else {
      newLogs.push(
        {
          timestamp: time(310),
          service: 'payment-service',
          level: 'INFO',
          traceId: id,
          message: 'Payment authorized. Gateway chargeId: ch_3N2819a'
        },
        {
          timestamp: time(320),
          service: 'order-service',
          level: 'INFO',
          traceId: id,
          message: 'Received PaymentCompletedEvent. Order status updated to PAID. Trace completed successfully.'
        }
      )
    }

    setLogs((prev) => [...prev, ...newLogs])
  }

  const getMetricColor = (val: number, warn: number, crit: number) => {
    if (val >= crit) return 'text-red-500 stroke-red-500'
    if (val >= warn) return 'text-amber-500 stroke-amber-500'
    return 'text-green-500 stroke-green-500'
  }

  const latestVal = (arr: number[]) => arr[arr.length - 1]

  return (
    <div className="grid gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Request Rate */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>Throughput (RPS)</span>
            <FiActivity className="text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[var(--color-text-bright)]">
              {latestVal(metrics.rps)} <span className="text-[0.65rem] font-medium text-slate-500">req/s</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.rps, 200, 40)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: p99 Latency */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>p99 API Latency</span>
            <FiActivity className="text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-black ${getMetricColor(latestVal(metrics.latency), 150, 500).split(' ')[0]}`}>
              {latestVal(metrics.latency)} <span className="text-[0.65rem] font-medium text-slate-500">ms</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.latency, 200, 40)}
                fill="none"
                className={getMetricColor(latestVal(metrics.latency), 150, 500).split(' ')[1]}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: JVM Heap */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>JVM Active Threads</span>
            <FiActivity className="text-sky-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-black ${getMetricColor(latestVal(metrics.jvm), 80, 95).split(' ')[0]}`}>
              {latestVal(metrics.jvm)} <span className="text-[0.65rem] font-medium text-slate-500">active</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.jvm, 200, 40)}
                fill="none"
                className={getMetricColor(latestVal(metrics.jvm), 80, 95).split(' ')[1]}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 4: Kafka Lag */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>Kafka Msg Lag</span>
            <FiActivity className="text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-black ${getMetricColor(latestVal(metrics.kafkaLag), 20, 100).split(' ')[0]}`}>
              {latestVal(metrics.kafkaLag)} <span className="text-[0.65rem] font-medium text-slate-500">msgs</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.kafkaLag, 200, 40)}
                fill="none"
                className={getMetricColor(latestVal(metrics.kafkaLag), 20, 100).split(' ')[1]}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Log Console Frame */}
      <div className="glass-card p-4 space-y-3 flex flex-col h-[380px]">
        <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-green-500/10 text-green-500">
              <FiTerminal size={14} />
            </span>
            <span className="text-xs font-bold text-[var(--color-text-bright)]">Distributed Trace Logs (Correlation context)</span>
          </div>
          
          <button
            onClick={triggerTransaction}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-[0.65rem] font-bold text-white shadow transition-transform active:scale-95 cursor-pointer"
          >
            <FiPlay size={10} /> Submit Transaction
          </button>
        </div>

        {/* Logs viewport */}
        <div className="flex-1 overflow-y-auto font-mono text-[0.6rem] space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 select-text leading-relaxed">
          {logs.map((log, idx) => (
            <div key={idx} className="hover:bg-slate-900/60 py-0.5 rounded px-1 flex gap-2">
              <span className="text-slate-500 shrink-0 select-none">[{log.timestamp.split('T')[1].slice(0, 12)}]</span>
              <span className={`font-semibold shrink-0 select-none ${
                log.service === 'gateway-service' ? 'text-teal-400' :
                log.service === 'order-service' ? 'text-blue-400' :
                log.service === 'payment-service' ? 'text-indigo-400' : 'text-purple-400'
              }`}>
                {log.service.padEnd(16)}
              </span>
              <span className={`font-bold shrink-0 select-none ${
                log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {log.level.padEnd(5)}
              </span>
              <span className="text-slate-500 font-semibold shrink-0 select-none">{log.traceId}</span>
              <span className="text-slate-100 flex-1">{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}
