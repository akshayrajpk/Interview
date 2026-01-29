Stream Code

import java.util.stream.*;
import java.util.*;


public class Main
{
	public static void main(String[] args) {
		int[] ary = {1,2,3,4,5,7,6,3,2,1,1,1,1};
		String am = "aaaabbbcdc";
		String[] wordAry = {"apple", "banana", "grape", "kiwi", "orange", "pear"};
		
// 		Arrays.stream(ary).forEach(System.out::println);
// 		Arrays.stream(ary).sorted(Comparator.comparingInt(Integer::intValue))
// 		.forEach(System.out::println);

        // String ar = Arrays.stream(ary).boxed().collect(Collectors.collectingAndThen(
        //     Collectors.groupingBy(number -> number, Collectors.counting()),
        //     map -> map.entrySet().stream()
        //     .map(e-> e.getKey() + String.valueOf(e.getValue()))
        //     .collect(Collectors.joining())
        //     ));
        //     System.out.println(ar);
        
        // String sr = am.chars().mapToObj(c-> (char) c).collect(Collectors.collectingAndThen(
        //     Collectors.groupingBy(c->c, Collectors.counting()),
        //     map -> map.entrySet().stream()
              .map(e-> e.getValue() > 1 ? e.getKey() + String.valueOf(e.getValue()) : String.valueOf(e.getKey  ()))
        //     .collect(Collectors.joining())
        //     )
        //     );
        // System.out.println(sr);
        // 		String[] wordAry = {"apple", "banana", "grape", "kiwi", "orange", "pear"};

        
        // Arrays.stream(wordAry).collect(Collectors.groupingBy(String::length, Collectors.counting())).entrySet().stream()
        // .forEach(System.out::println);
        
        char cjk= am.chars().mapToObj(c-> (char)c)
            .collect(Collectors.collectingAndThen(
            Collectors.groupingBy(c-> c, Collectors.counting()),
            map -> map.entrySet().stream()
            .sorted((a,b)-> Long.compare(b.getValue(), a.getValue()))
            .limit(1)
            .map(Map.Entry::getKey)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No characters in the string")) 
            ));
            System.out.println(cjk);

            List<Integer> numbers = Arrays.asList(123, 231, 456);
	    
	    String hjk = numbers.stream().map(String::valueOf)
	    .collect(Collectors.joining()).chars()
	    .mapToObj(c-> (char)c)
	    .collect(Collectors.collectingAndThen(
	        Collectors.groupingBy(c->c, Collectors.counting()),
	        map -> map.entrySet().stream()
	        .sorted(Map.Entry.comparingByKey())
	        .map(e-> e.getKey() +":"+ e.getValue())
	        .collect(Collectors.joining(","))
	        ));
	        
	        System.out.println(hjk);

        	String[] fruits = {"apple", "banana", "orange", "apple", "orange", "banana", "apple"};
		String result = Arrays.stream(fruits).collect(Collectors.collectingAndThen(
		                                  Collectors.groupingBy(c-> c,Collectors.counting()),
		                                  map -> map.entrySet().stream()
		                                  .sorted(Map.Entry.<String, Long>comparingByValue()
		                                  .thenComparing(Map.Entry.comparingByKey()))
		                                  .map(e-> e.getKey())
		                                  .collect(Collectors.joining(","))
		                              ));
		                              System.out.println(result); 


         String and = "ad@f%hj*io$hj";
        
        String input = "ad@f%hj*io$hj";

        Iterator<Character> res = IntStream.range(0, input.length())
            .mapToObj(i ->  Character.isAlphabetic(input.charAt(i)) ? input.charAt(i) : null)
            .filter(Objects::nonNull)
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> {
                    Collections.reverse(list);
                    return list.iterator();
                }
                ));
            
            StringBuilder sb = new StringBuilder(input);
            
            IntStream.range(0, input.length())
            .forEach(i -> {
                if(Character.isAlphabetic(input.charAt(i))){
                    sb.setCharAt(i, res.next());
                }
            });
        
        
            System.out.println(sb.toString());
	}
}


OptionalDouble secondHighest = employees.stream()
    .mapToDouble(Employee::getSalary)
    .distinct()                      // Remove duplicates to find actual 2nd highest
    .boxed()                         // Convert to Stream<Double>
    .sorted(Comparator.reverseOrder()) 
    .skip(1)                         // Skip the highest
    .mapToDouble(Double::doubleValue)
    .findFirst();

secondHighest.ifPresent(System.out::println);

Optional<Employee> secondEmployee = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::getSalary).reversed())
    .distinct()                      // Depends on your .equals() implementation
    .skip(1)
    .findFirst();

Double targetSalary = employees.stream()
    .map(Employee::getSalary)
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst()
    .orElseThrow(() -> new RuntimeException("No second highest salary found"));

List<Employee> result = employees.stream()
    .filter(e -> e.getSalary() == targetSalary)
    .collect(Collectors.toList());

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

List<Employee> sortedEmployees = employees.stream()
    .sorted(Comparator.comparing(Employee::getDesignation)
        .thenComparing(Employee::getAge)
        .thenComparing(Employee::getGender))
    .collect(Collectors.toList());


# int array reverse

int[] reversed = IntStream.of(ary)
                          .boxed()
                          .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                              Collections.reverse(list);
                              return list.stream();
                          }))
                          .mapToInt(Integer::intValue)
                          .toArray();
