# Coding Factors

Access Order: If you want the order to be based on the most recently accessed entries, you can specify true as the second argument to the constructor.

Map<String, String> map = new LinkedHashMap<>(16, 0.75f, true);

With access order, the order of the entries in the map will be based on their access order. When you call get() or put(), the accessed entry is moved to the end of the map.

# Special character count

String inputString = "Hello! @World# 2021$%";
        String specialCharCount = inputString.chars()  
            .filter(c -> !Character.isLetterOrDigit(c) && c != ' ')  // Filter special characters (excluding spaces)
            .mapToObj(c -> String.valueOf((char) c))  // Convert int to char and then to String
            .reduce("", (a, b) -> a + b);  // Concatenate special characters
        System.out.println("Special Characters: " + specialCharCount);
        System.out.println("Number of Special Characters: " + specialCharCount.length());

# Reverse with characters intact

import java.util.Stack;
        String inputString = "Hello! @World# 2021$%";        
        char[] chars = inputString.toCharArray();
        Stack<Character> letterStack = new Stack<>();        
        for(char c: chars){
            if(Character.isLetter(c)){
                letterStack.push(c);
            }
        }        
        for (int i = 0; i < chars.length; i++) {
            if (Character.isLetter(chars[i])) {
                // Pop a letter from the stack and put it in place
                chars[i] = letterStack.pop();
            }
        }
        System.out.println(chars);

# Longest Palinndrome

public class Main {
    public static void main(String[] args) {
        String inputString = "babad";
        String longestPalindrome = longestPalindrome(inputString);
        System.out.println("Longest Palindrome Substring: " + longestPalindrome);
    }

    public static String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        int start = 0, end = 0;
// Expand around center: Two cases, odd-length and even-length palindromes
        for (int i = 0; i < s.length(); i++) {
// Odd-length palindromes (expand around one character)
            int len1 = expandAroundCenter(s, i, i);
// Even-length palindromes (expand around two characters)
            int len2 = expandAroundCenter(s, i, i + 1);            
// Find the longest palindrome
            int len = Math.max(len1, len2);
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        return s.substring(start, end + 1);
    }
    // Helper method to expand around the center and return the length of the palindrome
    public static int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        // Length of the palindrome
        return right - left - 1;
    }
}

# Average of 2D array

String[][] data = {
            {"Alice", "80"},
            {"Bob", "90"},
            {"Alice", "70"},
            {"Bob", "85"},
            {"Charlie", "95"}
        };
        double bestAverage =
                Arrays.stream(data)
                      .collect(Collectors.groupingBy(
                          row -> row[0],                         // name
                          Collectors.averagingInt(
                              row -> Integer.parseInt(row[1])    // marks
                          )
                      ))
                      .values()
                      .stream()
                      .mapToDouble(Double::doubleValue)
                      .max()
                      .orElse(0);

# Maximum subarray
public static void main(String[] args) {
         int[] nums = {-2,1,-3,4,-1,2,1,-5,4};
         int maxSum = nums[0];
         int inter = nums[0];
         
         for(int i= 1; i< nums.length; i++){
            inter = Math.max(nums[i], inter + nums[i]);
            maxSum = Math.max(maxSum, inter);
         }
        System.out.println(maxSum);
	}

# Roman to int
public static void main(String[] args) {
	    String s = "IV";
	    
	    Map<Character, Integer> map = new HashMap<>();
        map.put('I', 1);
        map.put('V', 5);
        map.put('X', 10);
        map.put('L', 50);
        map.put('C', 100);
        map.put('D', 500);
        map.put('M', 1000);
        
        int ans = 0;
        int prev = 0;
        
        for(int i = s.length() -1; i >= 0; i--){
            int cur = map.get(s.charAt(i));
            if(cur< prev){
                ans -= cur;
            }
            
            else ans+=cur;
            
            prev = cur;
        }
        
        System.out.println(ans);
}

# Number Palindrome
public boolean isPalindrome(int x) {
        if (x < 0) {
            return false;
        }
        long reversed = 0;
        long temp = x;
        while (temp != 0) {
            int digit = (int) (temp % 10);
            reversed = reversed * 10 + digit;
            temp /= 10;
        }
        return (reversed == x);
    } 

# Remove Element from the array
class Solution {
    public int removeElement(int[] nums, int val) {
        int index = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                nums[index] = nums[i];
                index++;
            }
        }
        return index;
    }
}

# Contains Duplicate
class Solution {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (seen.contains(num))
                return true;
            seen.add(num);
        }
        return false;
    }
}

# Majority Element
public static void main(String[] args) {
	    int[] nums = {3,2,3,2, 2};
	    int candidate = nums[0];
	    int count = 0;
	    for(int i=0; i<nums.length; i++){
	        if(count == 0){
	            candidate = nums[i];
	        }
	        if(nums[i] == candidate){
	            count++;
	        }
	        else count --;
	    }
	    System.out.println(candidate);
	}

# Missing Number
class Solution {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int[] v = new int[n+1];
        Arrays.fill(v, -1);
        for(int i = 0; i < nums.length; i++) {
            v[nums[i]] = nums[i];
        }
        for(int i = 0; i < v.length; i++) {
            if(v[i] == -1) return i;
        }
        return 0;
    }
}

import java.util.Arrays;
class Solution {
    public int missingNumber(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;        
        // Case 1
        if (nums[0] != 0) return 0;        
        // Case 2
        if (nums[n - 1] != n) return n;        
        // Case 3
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != i) return i;
        }        
        return 0;
    }
}


# Longest Substring Without Repeating Characters
		
		String str = "abcdefgacabcdefghijk";
		
		Set<Character> set = new HashSet<>();
		
		int j = 0;
		int maxLen = 0;
		int start;
		
		for(int i=0; i< str.length(); i++){
		    while(set.contains(str.charAt(i))){
		        set.remove(str.charAt(j));
		        j++;
		        start = j;
		    }
		  
		        set.add(str.charAt(i));
		        maxLen = Math.max(maxLen, i-j+1);
		  
		}
		System.out.println(maxLen);
		System.out.println(str.substring(j, j + maxLen));

        public class Main {
    public static void main(String[] args) {
        String str = "ababcbb";
        Set<Character> st = new HashSet<>();
        int j = 0;
        int max = 0;
        int startIndex = 0; // store start of longest substring

        for (int i = 0; i < str.length(); i++) {
            while (st.contains(str.charAt(i))) {
                st.remove(str.charAt(j));
                j++;
            }
            st.add(str.charAt(i));

            // update max and start index if needed
            if (i - j + 1 > max) {
                max = i - j + 1;
                startIndex = j;
            }
        }

        System.out.println("Length of longest substring: " + max);
        System.out.println("Longest substring: " + str.substring(startIndex, startIndex + max));
    }
}

	
# Intersection of two arrays

  int[] ary = {1,2,3,4,5,6,7,8};
	    Set<?> sets = new HashSet(Set.of(5,6,7,8,9,10));
	    
	   // Set<Integer> st = new HashSet<Integer>(Arrays.asList(ary));
	  Set<Integer> st = Arrays.stream(ary).boxed().collect(Collectors.toSet());
	   // List<?> lis = new ArrayList(List.of(1,2,3,4,5,6,7));
	   
	   sets.stream().filter(e-> st.contains(e)).forEach(System.out::println);
	    
	   // st.stream().forEach(System.out::println);
	   // lis.stream().forEach(System.out::println);
	    
	   // System.out.println(lis);

# move zeros to the end

public static void main(String[] args) {
	    int[] ary = {1,0,3,4,0,0,7,8};
	    int count = 0;
	    for(int i=0; i<ary.length; i++){
	        if(ary[i] != 0){
	            ary[count++] = ary[i];
	        }
	    }
	    while(count < ary.length){
	        ary[count++] = 0;
	    }
	    Arrays.stream(ary).forEach(System.out::println);
	    System.out.println(ary);
	}

# Reverse LL
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode node = null;
        while (head != null) {
            ListNode temp = head.next;
            head.next = node;
            node = head;
            head = temp;
        }
        return node;        
    }
}

# Detect Cycle
public class Solution {
    public boolean hasCycle(ListNode head) {
        // Handle empty list or single node without a loop
        if (head == null || head.next == null) {
            return false;
        }

        ListNode slow = head; // Tortoise
        ListNode fast = head; // Hare

        while (fast != null && fast.next != null) {
            slow = slow.next;          // Move 1 step
            fast = fast.next.next;     // Move 2 steps

            // If they meet, there's a cycle
            if (slow == fast) {
                return true;
            }
        }

        // Fast reached the end, so no cycle exists
        return false;
    }
}

# 1299. Replace Elements with Greatest Element on Right Side

class Solution {
    public int[] replaceElements(int[] arr) {
        int n = arr.length;
        int maxSoFar = -1;  // Initialize with -1 for the last element
        
        // Traverse from right to left
        for (int i = n - 1; i >= 0; i--) {
            int current = arr[i];  // Store current value
            arr[i] = maxSoFar;     // Replace with max from right
            maxSoFar = Math.max(maxSoFar, current);  // Update max
        }        
        return arr;
    }
}

# 3254. Find the Power of K-Size Subarrays I

int[] arr = {3,2,3,2,3,2};
     int k = 2;
     
     int[] ans = new int[arr.length - k+1];
     int i= 0;
     int j = k-1;
     int a=0;     
     while(j< arr.length){
         boolean valid = true;
         for(int l=i; l<j; l++){
             if(arr[l] +1 != arr[l+1]){
                valid = false;
                break;
             }                
         }
         ans[a] = valid ? arr[j] : -1;
         i++;
         j++;
         a++;         
     }     
     Arrays.stream(ans).forEach(System.out::println);


# public class SearchInsertPosition {

    public static int searchInsertPosition(int[] nums, int target) {
        int left = 0, right = nums.length - 1;

        // Perform binary search
        while (left <= right) {
            int mid = left + (right - left) / 2; // To avoid overflow

            if (nums[mid] == target) {
                return mid; // If target is found, return the index
            }
            if (nums[mid] > target) {
                right = mid - 1; // Target is smaller, search in the left half
            } else {
                left = mid + 1; // Target is larger, search in the right half
            }
        }

        // If the target is not found, return the position where it can be inserted
        return left; // left will be at the correct insertion position
    }

    public static void main(String[] args) {
        // Test cases
        System.out.println(searchInsertPosition(new int[]{1, 3, 4, 5}, 2)); // Output: 1
        System.out.println(searchInsertPosition(new int[]{1, 3, 4, 5}, 7)); // Output: 4
        System.out.println(searchInsertPosition(new int[]{1, 3, 4, 5}, 0)); // Output: 0
        System.out.println(searchInsertPosition(new int[]{1, 3, 4, 5}, 4)); // Output: 2
    }
}



