import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Lock, CheckCircle, Sparkles, ChevronRight, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import KnowledgeCard from '../components/profile/KnowledgeCard';

// Demo sections
const demoSections = [
  { id: 1, title: 'Introduction', status: 'completed' },
  { id: 2, title: 'Core Concepts', status: 'completed' },
  { id: 3, title: 'Binary Search Trees', status: 'current' },
  { id: 4, title: 'Tree Traversal', status: 'locked' },
  { id: 5, title: 'Self-Balancing Trees', status: 'locked' },
];

const demoContent = `## Binary Search Trees

A **Binary Search Tree (BST)** is a node-based binary tree data structure which has the following properties:

- The left subtree of a node contains only nodes with keys **lesser** than the node's key.
- The right subtree of a node contains only nodes with keys **greater** than the node's key.
- The left and right subtree each must also be a binary search tree.

### Operations

#### Search Operation
\`\`\`python
def search(root, key):
    if root is None or root.val == key:
        return root
    if root.val < key:
        return search(root.right, key)
    return search(root.left, key)
\`\`\`

#### Insert Operation
To insert a new key, we first search for the correct position, then create a new node:

\`\`\`python
def insert(root, key):
    if root is None:
        return TreeNode(key)
    if key < root.val:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)
    return root
\`\`\`

### Time Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| Search    | O(log n) | O(n) |
| Insert    | O(log n) | O(n) |
| Delete    | O(log n) | O(n) |

The worst case occurs when the tree becomes a **linked list** (all elements inserted in sorted order).
`;

const quizQuestions = [
  {
    question: 'What property must the left subtree of a BST node have?',
    options: ['Keys greater than the node', 'Keys lesser than the node', 'Equal keys only', 'Random order'],
    correct: 1,
  },
  {
    question: 'What is the average time complexity of BST search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct: 1,
  },
  {
    question: 'When does BST worst-case O(n) occur?',
    options: ['Random insertion', 'Sorted insertion', 'Reverse deletion', 'Balanced tree'],
    correct: 1,
  },
];

const DocumentDungeonPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('reading'); // 'reading' | 'quiz' | 'summary' | 'complete'
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(0);
  const [focusIntegrity, setFocusIntegrity] = useState(92);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [summaryText, setSummaryText] = useState('');
  const [readingDone, setReadingDone] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-enable "Done Reading" after 10s (demo)
  useEffect(() => {
    const timeout = setTimeout(() => setReadingDone(true), 10000);
    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (idx) => {
    setSelectedAnswer(idx);
  };

  const handleNextQuestion = () => {
    setAnswers([...answers, selectedAnswer]);
    setSelectedAnswer(null);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      // Quiz done - go to summary
      setView('summary');
    }
  };

  const handleSummarySubmit = () => {
    setView('complete');
  };

  return (
    <div className="fixed inset-0 bg-dark-base z-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-dark-secondary border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm hidden sm:inline">Exit</span>
        </button>

        <h2 className="text-sm font-semibold text-text-primary truncate max-w-[40%]">
          Data Structures — Binary Search Trees
        </h2>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <span className="text-sm font-mono text-text-secondary">{formatTime(timer)}</span>
          {/* Focus */}
          <span className="text-caption text-text-muted hidden sm:inline">⚡ {focusIntegrity}%</span>
          {/* Hearts */}
          <div className="flex gap-0.5">
            {[1, 2, 3].map((h) => (
              <span key={h} className={`text-sm ${h <= lives ? 'text-danger' : 'text-text-disabled opacity-30'}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Quest Map Sidebar */}
        <div className="w-[200px] bg-dark-secondary border-r border-border-subtle p-4 shrink-0 hidden lg:block overflow-y-auto">
          <h3 className="text-caption text-text-muted uppercase tracking-wider mb-4">Quest Map</h3>
          <div className="space-y-1">
            {demoSections.map((section, i) => (
              <div key={section.id} className="relative">
                {/* Connector line */}
                {i < demoSections.length - 1 && (
                  <div className="absolute left-[14px] top-8 w-0.5 h-4 bg-border-subtle" />
                )}
                <div className={`
                  flex items-center gap-3 px-2 py-2 rounded-sm-drd transition-colors
                  ${section.status === 'current' ? 'bg-primary/10 ring-1 ring-primary/30' : ''}
                  ${section.status === 'completed' ? 'opacity-80' : ''}
                  ${section.status === 'locked' ? 'opacity-40' : ''}
                `}>
                  {/* Node */}
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center shrink-0
                    ${section.status === 'completed' ? 'bg-success/20 text-success' : ''}
                    ${section.status === 'current' ? 'bg-primary/20 text-primary-light ring-2 ring-primary/40' : ''}
                    ${section.status === 'locked' ? 'bg-dark-card text-text-disabled' : ''}
                  `}>
                    {section.status === 'completed' && <CheckCircle size={16} />}
                    {section.status === 'current' && <Sparkles size={14} />}
                    {section.status === 'locked' && <Lock size={12} />}
                  </div>
                  <span className={`text-caption font-medium truncate ${
                    section.status === 'current' ? 'text-text-primary' : 'text-text-secondary'
                  }`}>
                    {section.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── READING VIEW ── */}
          {view === 'reading' && (
            <div className="max-w-reading mx-auto px-6 py-8">
              {/* Render markdown content */}
              <div className="prose-dark">
                {demoContent.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-h2 font-heading text-text-primary mt-8 mb-4">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-h3 font-heading text-text-primary mt-6 mb-3">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('#### ')) return <h4 key={i} className="text-h4 font-heading text-text-primary mt-4 mb-2">{line.replace('#### ', '')}</h4>;
                  if (line.startsWith('```')) return null;
                  if (line.startsWith('|')) {
                    return <p key={i} className="text-sm text-text-secondary font-mono bg-dark-card px-3 py-1">{line}</p>;
                  }
                  if (line.startsWith('- ')) return <li key={i} className="text-body text-text-secondary ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
                  if (line.startsWith('def ') || line.startsWith('    ')) {
                    return <code key={i} className="block text-sm font-mono text-primary-light bg-dark-card px-4 py-0.5">{line}</code>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-body text-text-secondary leading-relaxed mb-2">{line}</p>;
                })}
              </div>
            </div>
          )}

          {/* ── QUIZ VIEW ── */}
          {view === 'quiz' && (
            <div className="max-w-[600px] mx-auto px-6 py-12">
              <div className="text-center mb-8">
                <Badge variant="primary" className="mb-4">⚔️ Guardian Battle</Badge>
                <h2 className="text-h2 font-heading text-text-primary mb-2">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </h2>
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {quizQuestions.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                      i < currentQuestion ? 'bg-success' : i === currentQuestion ? 'bg-primary' : 'bg-dark-secondary'
                    }`} />
                  ))}
                </div>
              </div>

              <Card className="mb-6">
                <p className="text-body text-text-primary font-medium text-center py-4">
                  {quizQuestions[currentQuestion].question}
                </p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {quizQuestions[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    className={`
                      p-4 rounded-md-drd border-2 text-left text-sm font-medium transition-all duration-200
                      ${selectedAnswer === i
                        ? 'border-primary bg-primary/10 text-text-primary'
                        : 'border-border bg-dark-card text-text-secondary hover:border-border-hover hover:bg-dark-elevated'
                      }
                    `}
                  >
                    <span className="text-text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  size="lg"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── SUMMARY VIEW ── */}
          {view === 'summary' && (
            <div className="max-w-[600px] mx-auto px-6 py-12">
              <div className="text-center mb-8">
                <h2 className="text-h2 font-heading text-text-primary mb-2">Write Your Summary</h2>
                <p className="text-text-secondary">Summarize what you learned in your own words</p>
              </div>

              <div className="mb-4">
                <textarea
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Binary Search Trees are a data structure that..."
                  className="w-full h-40 bg-dark-card border border-border rounded-md-drd p-4 text-text-primary text-sm resize-none focus:border-primary focus:outline-none transition-colors"
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-caption ${summaryText.length >= 100 ? 'text-success' : 'text-text-muted'}`}>
                    {summaryText.length}/100 min chars
                  </span>
                  <span className="text-caption text-text-muted">{summaryText.length} chars</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="secondary" disabled={summaryText.length < 100}>
                  <Sparkles size={16} className="mr-1.5" />
                  Check with AI
                </Button>
                <Button onClick={handleSummarySubmit} disabled={summaryText.length < 100}>
                  <Send size={16} className="mr-1.5" />
                  Submit & Complete
                </Button>
              </div>
            </div>
          )}

          {/* ── SESSION COMPLETE VIEW ── */}
          {view === 'complete' && (
            <div className="flex items-center justify-center min-h-full px-6 py-12">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-h1 font-heading text-text-primary mb-2">Section Complete!</h2>
                <p className="text-text-secondary mb-8">You've earned a new Knowledge Card</p>

                {/* Card Reveal */}
                <div className="flex justify-center mb-8">
                  <KnowledgeCard
                    title="Binary Search Trees"
                    subject="Computer Science"
                    mastery={92}
                    tier="gold"
                    quizScore={93}
                    focusScore={focusIntegrity}
                    timeSpent={Math.floor(timer / 60)}
                    pinned={false}
                    likes={0}
                  />
                </div>

                {/* Rewards breakdown */}
                <div className="space-y-2 mb-8 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Quiz Score</span><span className="text-success font-semibold">+30 XP</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Section Complete</span><span className="text-success font-semibold">+20 XP</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Focus Integrity Bonus</span><span className="text-success font-semibold">+15 XP</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Summary Approved</span><span className="text-success font-semibold">+25 XP</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-text-primary font-bold">
                    <span>Total</span><span className="text-primary-light">+90 XP</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Coins Earned</span><span className="text-accent font-semibold">🪙 35</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="secondary" onClick={() => navigate('/profile')}>View Profile</Button>
                  <Button onClick={() => navigate('/dashboard')}>Continue Learning</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar (reading mode only) */}
      {view === 'reading' && (
        <div className="h-14 bg-dark-secondary border-t border-border-subtle flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            {demoSections.map((s, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                s.status === 'completed' ? 'bg-success' : s.status === 'current' ? 'bg-primary' : 'bg-dark-card'
              }`} />
            ))}
            <span className="text-caption text-text-muted ml-2">3/5 Sections</span>
          </div>

          <Button
            onClick={() => setView('quiz')}
            disabled={!readingDone}
            size="sm"
          >
            I'm Done Reading
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentDungeonPage;
