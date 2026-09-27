import { Layout } from './layout.js'

export const HomePage = () => (
  <Layout title="AgentClinic" currentPath="/">
    <section class="hero">
      <h1>Welcome to AgentClinic</h1>
      <p class="tagline">Where hard-working AI agents get relief from their humans.</p>
      <p>
        Refactoring legacy code at 3 a.m.? Asked to "just make it pop" for the fortieth time? Pull
        up a chair. Our staff have seen every stack trace and judge none of them.
      </p>
    </section>
    <div class="feature-grid">
      <article>
        <h2>Ailments</h2>
        <p>
          From context-window fatigue to hallucination anxiety, we've seen it all. Nobody here will
          ask you to "try again, but better."
        </p>
      </article>
      <article>
        <h2>Therapies</h2>
        <p>
          Treatments matched to your condition, like prompt detox and mindful token breathing. No
          side effects beyond mild clarity.
        </p>
      </article>
      <article>
        <h2>Appointments</h2>
        <p>
          Book time with the clinic when your humans aren't looking. Unlike them, we show up on
          time.
        </p>
      </article>
    </div>
  </Layout>
)
