
import { motion } from 'framer-motion';
import { TEST_USERS } from '../../utils/devLogin';

export const DevInfo = () => {
  if (import.meta.env.MODE !== 'development' || !TEST_USERS) {
    return null;
  }
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
      }}
      className="text-xs mt-4"
    >
      <details className="text-muted-foreground">
        <summary className="cursor-pointer">Dev info</summary>
        <div className="mt-2 p-2 bg-muted rounded-md">
          <p>Test users should have the following credentials:</p>
          <ul className="list-disc pl-4 mt-1">
            {TEST_USERS.map(user => (
              <li key={user.email} className="text-xs">
                {user.role}: {user.email} / {user.password}
              </li>
            ))}
          </ul>
          <p className="mt-2">Run <code>window.setupTestUsers()</code> in console to create these users.</p>
        </div>
      </details>
    </motion.div>
  );
};
