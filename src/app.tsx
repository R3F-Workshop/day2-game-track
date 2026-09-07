import { type ComponentType, lazy, Suspense } from 'react';

type StepModule = { App: ComponentType };

// The practice game lives in src/game and every completed step in src/steps. Each folder is a
// whole game with its own world, so only the chosen one is loaded.
const Practice = lazy(() => import('./game/app').then(({ App }) => ({ default: App })));

const steps = Object.entries(import.meta.glob<StepModule>('./steps/*/app.tsx'))
  .map(([path, load]) => {
    const [id, name] = path.split('/')[2].split('-', 2);
    return {
      id: String(Number(id)),
      name,
      Step: lazy(() => load().then(({ App }) => ({ default: App }))),
    };
  })
  .sort((a, b) => Number(a.id) - Number(b.id));

export function App() {
  const id = new URLSearchParams(window.location.search).get('step');
  const current = steps.find((step) => step.id === id);
  const Current = current?.Step ?? Practice;

  return (
    <>
      <Suspense fallback={null}>
        <Current />
      </Suspense>
      <nav
        aria-label="Lessons"
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          maxWidth: 'calc(100% - 2rem)',
          padding: 8,
          borderRadius: 16,
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          fontSize: 12,
        }}
      >
        <StepLink href="./" label="game" active={!current} title="Your practice game" />
        {steps.map((step) => (
          <StepLink
            key={step.id}
            href={`?step=${step.id}`}
            label={step.id}
            active={step === current}
            title={step.name}
          />
        ))}
      </nav>
    </>
  );
}

function StepLink({
  href,
  label,
  active,
  title,
}: {
  href: string;
  label: string;
  active: boolean;
  title: string;
}) {
  return (
    <a
      href={href}
      title={title}
      aria-current={active ? 'step' : undefined}
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        color: active ? 'black' : 'white',
        background: active ? 'white' : 'transparent',
        textDecoration: 'none',
      }}
    >
      {label}
    </a>
  );
}
