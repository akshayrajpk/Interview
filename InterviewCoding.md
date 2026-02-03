public class Sample {

    public static void main(String[] args) {

        Set<String> treeSet = new TreeSet<>();

        treeSet.add("Indian");

        treeSet.add("Premier");

        treeSet.add("League");

        treeSet.add("Premier");

        treeSet.add("IndianPremierLeague");

        for (String temp : treeSet)

            System.out.println(temp + " ");

    }

}
 
Indian, IndianPremierLeague, League, Premier



public class JavaStringsQuiz
{
    public static void main(String[] args)
    {
        String str1 = new String("Java");
 
        String str2 = new String("Java");
 
        String str3 = "Java";
 
        String str4 = "Java";
 
        System.out.println(str1 == str2);
		System.out.println(str3 == str4);
        System.out.println(str1 == str3);
    }
}


False, True, False




class Parent {
 
    Parent (){
        this("Constructor");
        System.out.println("Parent class Default Constructor");
    }
 
    Parent (String s){
        System.out.println("Parent Class Param  "+s);
    }
}
 
public class Child extends Parent {
 
    Child (){
        super("Constructor");
        System.out.println("Child Class Default Constructor");
    }
 
    Child (String s){
        System.out.println("Child Class Param Constructor "+s);
    }
 
    public static void main(String[] args) {
        Child obj = new Child();
    }
 
}
 

Parent Class Param Constructor
Child Class Default Constructor

Child Class Param Constructor Constructor
Child Class Default Constructor



//Immutable student class

final class Student{
private static final int id;
private static final List<String> marks;

public coT()

//Setters 

//getters

return int id

ret marks(){
	new ArrayList<String> = new Al()

==============================================


import java.io.*;
import java.util.*;

public class Main
{
	public static void main(String[] args) {
	    int[] input = new int[]{12, 35, 1, 10, 34, 1, 35};
	    //Expected ans is 34.
	    int  secondLargetValue = getSecondLarget(input);
		System.out.println(secondLargetValue);
	}
	static int getSecondLarget(int[] input){
	   // Arrays.stream
	    
	   // return Arrays.stream(input).mapToInt(e-> int(e)).sort(Comparator.reverseOrder()).skip(1).findFirst().orElse(0);
	   // return 0;
	   
	   int lar =0, sec=0;
	   
	   for(int i=0; i<input.length; i++){
	       if(input[i]> lar){
	           sec = lar;
	           lar = input[i];
	           
	       }
	       else if(input[i]>sec && input[i]< lar){
	           sec = input[i];
	       }
	   }
	   return sec;
	}
}


1 2 3 4 2 5 4 1Al

al.stream().collect(Collectors.groupingBy(c ->c, collectors.counting)..enterySet().stream().filter(e-> e.getData()>1).collect(Collectors.toMap())

s = "cbabcad"
Output: "cbabc"
i=0, j=s.length()-1

left right =0 

while(i<j){

if(s.charAt(I) != s.charat(j)) j--;

if(charAt(i)== char(j)}

left =I, right =j
i++ j--
}
s.subString(left, right)


count of occurrences based on input array o/p replace with the count of occourence same element
find middle of linked list in 1 iteration 


top 3 highest value 

AL listMark

listmark.stream().sorted(Comparator.reverseOrder()).limit(3)

Student.map(e-> e.getName).forEach(Sout)




import java.io.*;
import java.util.*;
 
//  Find the best average grade.
//  Given a list of student test scores
//  Each student may have more than one test score in the list.
 
 
class Main
{
//   public static Integer bestAvgGrade(String[][] scores)
//   {
//     // write your code goes here
    
//     Map<String, Integer> averageCalc = new HashMap<>();
    
//     for(int i=0; i<scores.length -1; i++){
//         for(int j=0; j<2; j++){
//             // System.out.println(scores[i][j]);
            
//             averageCalc.put(scores[i][0], scores[j]);
//             System.out.println(averageCalc);
            
//         }
        
        
//         System.out.println(scores[i]);
//     }
    
//     return 0;
//   }
 
//   public static boolean pass()
//   {
//     String[][] s1 = { { "Rohan", "84" },
//               { "Sachin", "102" },
//               { "Ishan", "55" },
//               { "Sachin", "18" } };
 
//     return bestAvgGrade(s1) == 84;
//   }
 
  public static void main(String[] args)
  {
    // if(pass())
    // {
    //   System.out.println("Pass");
    // }
    // else
    // {
    //   System.out.println("Some Fail");
    // }
    
    
//     Given a list of numbers int[] nums=[0,0,1,1,1,2,2,3,3,4]
//  * remove the the duplicate and return the array int[] nums=[0,1,2,3,4]

int[] nums = {0,0,1,1,1,2,2,3,3,4};
 
 Set<Integer> unique = new HashSet<>();
 
 for(int num: nums){
     unique.add(num);
 }
 
 System.out.println(unique);
    
  }
}


class Apple {
    private static Apple apple;
    
    private Apple(){}
    
    public Apple getApple(){
        if(apple == null){
            synchronized(Apple.class){
                if(apple == null)
                    return new Apple();
            }
           
        }
    }
}

You are given a table named Orders with the following columns:
 
OrderID (integer)
 
ProductCategory (varchar)
 
Amount (decimal)
 
Write an SQL query to find the top 2 product categories that have generated the highest total sales amount.
 Table: Orders
OrderID ProductCategory Amount
1   Electronics 150.00
2   Clothing    75.50
3   Electronics 200.00
4   Books   30.25
5   Clothing    120.00
6   Electronics 50.00
7   Books   45.75

select ProductCategory from Orders orderBy sum(amount) desc groupBy productcategory limit 2;



public class SpecialCharIndexes { public static void main(String[] args) { String str = "A@BC%D@"; AtomicInteger index = new AtomicInteger(0); Map<Character, List<Integer>> splMap = str.chars() .mapToObj(ch -> (char) ch) // convert int to Character .filter(c -> !Character.isLetterOrDigit(c)) .collect(Collectors.groupingBy( c -> c, // group by character Collectors.mapping( c -> str.indexOf(c, index.getAndIncrement()), Collectors.toList() ) )); System.out.println(splMap); } }


class Company {
    private Department department;
    public Department getDepartment() { return department; }
}
 
class Department {
    private Employee manager;
    public Employee getManager() { return manager; }
}
 
class Employee {
    private String email;
    public String getEmail() { return email; }
}
 
A Company object may or may not have:
a Department,
the Department may or may not have a Manager,
the Manager may or may not have an email.
 
Write a method:
public String getManagerEmail(Company company) 
that returns:
the manager's email if present,
otherwise return "N/A".

getMangeremail(company){
	comp = optional.ofnullable(Company.grtDeartment()).orElse(throw companyNotFoundExcep())

	comp.ifExist(comp -> comp.getManger())




Given a map of food keys and topping values, modify and return the map as follows: if the key "potato" has a value, set that as the value for the key "fries". If the key "salad" has a value, set that as the value for the key "spinach".
 
topping3({"potato": "ketchup"}) → {"potato": "ketchup", "fries": "ketchup"}
topping3({"potato": "butter"}) → {"potato": "butter", "fries": "butter"}
topping3({"salad": "oil", "potato": "ketchup"}) → {"spinach": "oil", "salad": "oil", "potato": "ketchup", "fries": "ketchup"}

Map<String, String> mapper = new HashMap<>();



public void mapperFunction(String dish){

if(dish == potato){

if(mapper.containsKey(dish))
{
	mapper.putOrDefault("fries", mapper.get(dish))
}
}
else if(dish == salad)
{
	if(mapper.containsKey(dish))
{
	mapper.getOrDefault("salad", mapper.get(dish)
}
}



Write a custom React Hook useSharedContext that subscribes to a global event emitter to listen for 'SchoolID' changes from the parent container and updates the local component state

Service

Observable<Stdent> std = SchoolState;

Services used

@component

EmitChange(e){SchoolState = event.getData()}

<Select onChange()><ng-for "SchoolList" option value = "SL.schoolNeme" >

<Other Services stdSubscription>




@KafkaListener(topics = "funding-updates", groupId = "finance-group", index=3)
public void consume(String message) {
try {
processPayment(message);
} catch (Exception e) {
System.out.println("Error processing: " + e.getMessage());
// Message is committed here effectively, so it's lost!
}
}





@autowired
@qualifier("primaryStudent)
Student student


@bean("primaryStudent")


@primary
@bean
student

@profile("Dev")
getDevConf(){


@profile(

@AuthenticationPrincipal JWT jwt

security,hasAuthority

@RestControllerAdvice
class

@ExceptionHandler(studentNoTfound.class)

service

Optional.ofNullable(findStudentBYId(.)).orElse(throw new studentNoTfound())

list<Employee> empList

empList.stream().map(Employee::getSalary).sort(Comparitor.descendingOder()).limit(2).



isRotation(String s1, String s2)
s1="abcd" s2="cdab"

Hm<Character, Integer> s1hm 

a1 = s1.chars()
a2 = s2.chars()

for(int i=0; i<n;i++){
s1hm.put(a1[i],I)

j = 1 flag = true
for(int i=0; i<n;i++){
	int a = s1hm.get(a2[i])
	int b = s1hm.get(a2[j])
	if(a+1 != b){
		s1hm.get(a2[j]) == 0
		break;
	
	else if(a+1 == b){
		s1hm.get(a2[j]) == 0
	else flag =false;
j++
}

return (flag)








--------------------------------------------------
import java.util.*;
import java.util.stream.*;

public class Main
{
	public static void main(String[] args) {
// 		System.out.println("Hello World");
		
		List<Integer> numList = Arrays.asList(1,2,3,4,2,3,5);
		
// 		numList.stream().filter(e-> numList.indexOf(e) != numList.lastIndexOf(e)).distinct()
// 		.forEach(System.out::println);

    // numList.stream().collect(Collectors.groupingBy(c-> c , Collectors.counting()))
    // .entrySet().stream().filter(a -> a.getValue() >=2).forEach(System.out::println);
    
    String str = "abcabcbb";
    
    Set<Character> occur = new HashSet<>();
    
    // char[] split = str.split();
    
    int j = 0;
    int maxLen = 0;
    int start = 0, end = 0;
    
    for(int i=0; i<str.length(); i++){ 
        if(occur.contains(str.charAt(i))){
            System.out.println(str.charAt(i));
            System.out.println(i);
            if(maxLen < i-j){
                start = j;
                end = i;
                maxLen = Math.max(maxLen, i-j) ;
                
                occur.remove(str.charAt(j));
                j++;
            }
            // maxLen = Math.max(maxlen, i-j);
            
        }
        occur.add(str.charAt(i));
    }
    
    String ans = str.substring(start,end);
    
    System.out.println(maxLen);
    
    
	}
}


You have a list of Employee objects. Filter employees whose salary is greater than 50,000.

List<Employee> lis 

Comparator ageCompare = (a,b) -> a.getAge() - b.getAge();

Comparator nameCompare = (a,b) -> a.getname().compareTo(b.getname());

lis.stream().filter(Employee::getSalary > 50000).sort(ageCompare).sort(nameCompare).collect(Collectors.toList());

ng g c



375 2 10 and 1 5

var num = 375
var incrementor = 1;
var records = [{}]

while(num!=0)
{
	let data = num%10;
	
	records = [...records, {incrementor:data}]
	
	incrementor = incrementor *10;

	num= num/10;
}


incr = 100;



val = num % incr;

records = [...records, {incrementor:val}]
incr /= 50

	


public class SpecialCharIndexes { public static void main(String[] args) { String str = "A@BC%D@"; AtomicInteger index = new AtomicInteger(0); Map<Character, List<Integer>> splMap = str.chars() .mapToObj(ch -> (char) ch) // convert int to Character .filter(c -> !Character.isLetterOrDigit(c)) .collect(Collectors.groupingBy( c -> c, // group by character Collectors.mapping( c -> str.indexOf(c, index.getAndIncrement()), Collectors.toList() ) )); System.out.println(splMap); } }



----------------------------------------------------

import java.util.*;
import java.util.stream.Collectors;

class Student {
    int id;
    String name;
    String status;

    Student(int id, String name, String status) {
        this.id = id;
        this.name = name;
        this.status = status;
    }

    public String getStatus() { return status; }
    
    @Override
    public String toString() { return name; }
}

public class Main {
    public static void main(String[] args) {
        List<Student> students = Arrays.asList(
            new Student(1, "Akshay", "Active"),
            new Student(2, "Raj", "Graduated"),
            new Student(3, "John", "Active"),
            new Student(4, "Doe", "Dual Enrollment")
        );

        // Using Java Streams to group by status
        Map<String, List<Student>> groupedByStatus = students.stream()
            .collect(Collectors.groupingBy(Student::getStatus));

        System.out.println(groupedByStatus);
    }
}




To fetch Lis of Stds

@Restcontroller
class Student{

@

Get: students

https://school.com/students/{email}?pageNumber=1&size=50&Filter=email

Headers: Authorization Bearer <token>

Response: {
pageNumber:
TotalRecords:
PageSize:
Rsp:{
	List<Students>
}
}

Select * from students limit 50 Offset 0

Search By email

Monitor api



["h",e,l,l,o]

while(i<j){
temp = arr[j]
arr[j] = arr[i]
arr[i] = temp;

i++;
j--;

arr.reduce("", (a,b) -> b + a).collect(Collectors.joining())

nums = [1,3,5,6], target = 5
Output: 2
 
Input: nums = [1,3,5,6], target = 2
Output: 1

for(i=0; i<nums.size; i++){
if(nums[i] == target){
	return i;
}
else if(nums[i]> target && i>nums.lengh())
	return i+1
else if(nums[i] < target && nums[i+1] > target}
	return i+1



nums = [0,1,0,3,12] 1,3,0,0
Output: [1,3,12,0,0]

left = 0; right = 1;

while(right<nums.length()){
if(nums[left] == 0 && nums[right]>0){
	swap
	left++;
	right ++;
}
right ++;





 











 
