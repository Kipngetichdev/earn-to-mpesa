import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const Tasking = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = React.useContext(React.createContext({ user: null })); // Assuming AuthContext

  // Fetch questions from OpenTDB
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://opentdb.com/api.php?amount=5&category=${categoryId}`);
        const data = await response.json();
        if (data.response_code === 0) {
          const formattedQuestions = data.results.map((q) => ({
            question: q.question,
            correctAnswer: q.correct_answer,
            choices: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
          }));
          setQuestions(formattedQuestions);
          setAnswers(new Array(formattedQuestions.length).fill(null));
          console.log('Fetched questions:', formattedQuestions); // Debug
        } else {
          setError('Failed to load questions.');
        }
      } catch (err) {
        setError('Failed to fetch questions.');
        console.error('Fetch questions error:', err);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [categoryId]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    console.log('Selected answer:', answer, 'Index:', currentQuestionIndex); // Debug
  };

  // Handle navigation
  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      console.log('Navigated to question:', currentQuestionIndex + 1); // Debug
    } else {
      // Submit quiz
      try {
        const score = answers.reduce((acc, answer, i) => 
          answer === questions[i].correctAnswer ? acc + 1 : acc, 0);
        const reward = localStorage.getItem(`${categoryId}_reward`) || 'KSh 4.00'; // Fallback
        const numericReward = parseFloat(reward.replace('KSh ', ''));

        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const currentEarnings = userDoc.exists() ? userDoc.data().earnings || 0 : 0;

          await updateDoc(userRef, {
            earnings: currentEarnings + numericReward,
            history: [
              ...(userDoc.exists() ? userDoc.data().history || [] : []),
              { categoryId, reward, completedAt: serverTimestamp(), score },
            ],
          });
          console.log('Quiz submitted:', { score, reward, categoryId }); // Debug
        }
        navigate('/home');
      } catch (err) {
        setError('Failed to submit quiz.');
        console.error('Submit quiz error:', err);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      console.log('Navigated back to question:', currentQuestionIndex - 1); // Debug
    }
  };

  if (loading) return <p className="text-primary font-roboto text-center">Loading questions...</p>;
  if (error) return <p className="text-highlight font-roboto text-center">{error}</p>;
  if (!questions.length) return <p className="text-primary font-roboto text-center">No questions available.</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4">
      <div className="w-full max-w-md">
        <h2 className="text-lg font-bold text-primary mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <div className="bg-white border border-primary rounded p-4 text-primary">
          <p className="text-lg font-bold text-primary mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
          <div className="space-y-2">
            {currentQuestion.choices.map((choice, index) => (
              <label
                key={index}
                className="flex items-center bg-white border border-primary rounded p-2 hover:bg-secondary transition duration-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={answers[currentQuestionIndex] === choice}
                  onChange={() => handleAnswer(choice)}
                  className="mr-2"
                />
                <span className="text-primary font-roboto" dangerouslySetInnerHTML={{ __html: choice }} />
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              className={`px-4 py-2 rounded font-roboto transition duration-300 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-white border border-primary text-primary hover:bg-secondary'
              }`}
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </button>
            <button
              className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
              onClick={handleNext}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasking;