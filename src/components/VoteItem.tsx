import { FaCircleCheck } from "react-icons/fa6";


interface Props { 
    choice: { name: string };
    onVote: () => void;
    selected: boolean;
}

export const VoteItem = ({ choice, onVote, selected }: Props) => {
  const styles = {
      container: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderRadius: 'var(--chakra-radii-xl)',
          border: selected ? '2px solid #22C55E' : '2px solid #E5E7EB',
          backgroundColor: selected ? '#ECFDF5' : '#FFFFFF',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
      },
      text: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333333',
      },
      checkbox: {
          width: '24px',
          height: '24px',
      },
  };

  return (
      <div style={styles.container} onClick={onVote}>
          <span style={styles.text}>{choice.name}</span>
          <div style={styles.checkbox}>
            {selected && <FaCircleCheck color="#22C55E" size={24} />}
          </div>
      </div>
  );
};