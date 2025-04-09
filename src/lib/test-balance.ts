
import { UserBalanceService } from './firebase-service';

export async function updateTestBalance(userId: string, newBalance: number) {
  try {
    await UserBalanceService.updateUserBalance(userId, newBalance);
    console.log('Balance updated successfully');
  } catch (error) {
    console.error('Error updating balance:', error);
  }
}
