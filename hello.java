import java.util.*;

public class hello{
    public static void main (String[] args) {
        int count_neg=0;
        int count_pos=0;
        int count_zer=0;
        int pro=1;
        int pos_min=0;
        int meg_max=0;
        Scanner scanner = new Scanner(System.in);
        int num = scanner.nextInt();
        int arr[] = new int[num];
        for(int i=0;i<num;i++){
            arr[i] = scanner.nextInt();
            if(arr[i] < 0) count_neg+=1;
            else if(arr[i] > 0) count_pos+=1;
            else count_zer+=1;
            


            if(arr[i] != 0) pro*=arr[i];
            if(arr[i] < 0) pos_min = Math.min(pos_min,arr[i]);
            if(arr[i] > 0) neg_max = Math.max(neg_max,arr[i]);
        }
        
        if(count_neg == 0 && count_zer >= 0){
            System.out.print(0);
        }
        else if(count_neg%2 == 0 && \)



        
    }
}